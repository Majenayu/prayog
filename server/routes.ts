import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { z } from "zod";
import { storage } from "./storage";
import { db } from "./db";
import { insertUserSchema, insertItemSchema, insertProductSchema, insertIndustryProductSchema, insertMachinePartSchema, insertHealthReportSchema, insertAppraisalSchema, insertExchangeSchema, insertItemPartSchema, insertPartRentalSchema, insertMachineSchema, insertMachineComponentSchema, cartItems, type InsertMachinePart } from "@shared/schema";
import { eq } from "drizzle-orm";
import { analyzeItemImage, generateHealthReport } from "./openai-service";

const upload = multer({ storage: multer.memoryStorage() });

// Validate Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  console.error("CLOUDINARY environment variables are not fully configured. Image uploads will not work.");
  console.error("Missing:", {
    cloud_name: !CLOUDINARY_CLOUD_NAME,
    api_key: !CLOUDINARY_API_KEY,
    api_secret: !CLOUDINARY_API_SECRET
  });
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

declare module "express-session" {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "rental-marketplace-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  // Helper function to upload to Cloudinary
  async function uploadToCloudinary(buffer: Buffer, folder: string = "rental-items"): Promise<{ url: string; publicId: string }> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: "auto" },
        (error, result) => {
          if (error) reject(error);
          else if (result) resolve({ url: result.secure_url, publicId: result.public_id });
          else reject(new Error("Upload failed"));
        }
      );

      const readableStream = Readable.from(buffer);
      readableStream.pipe(uploadStream);
    });
  }

  // Auth Routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(validatedData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const existingEmail = await storage.getUserByEmail(validatedData.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      const user = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
      });

      req.session.userId = user.id;
      const { password, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Registration failed" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      const { password: _, ...userWithoutPassword } = user;

      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { password, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to get user" });
    }
  });

  // Item Routes
  app.get("/api/items", async (req, res) => {
    try {
      const industryProducts = await storage.getIndustryProducts();
      res.json(industryProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch items" });
    }
  });

  app.get("/api/items/my-items", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const industryProducts = await storage.getIndustryProductsByIndustry(req.session.userId);
      res.json(industryProducts);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch items" });
    }
  });

  app.post("/api/items", upload.single("image"), async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user || user.role !== "industry") {
        return res.status(403).json({ message: "Only industries can add items" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Image is required" });
      }

      const { url, publicId } = await uploadToCloudinary(req.file.buffer);

      const commonData = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        imageUrl: url,
        createdById: req.session.userId,
      };

      const validatedCommonData = insertProductSchema.omit({ imageUrl: true }).parse(commonData);

      const product = await storage.createProduct({
        ...validatedCommonData,
        imageUrl: url,
        imagePublicId: publicId,
        machineType: req.body.machineType || undefined,
      });

      const industryData = {
        productId: product.id,
        industryId: req.session.userId,
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        pricePerDay: req.body.pricePerDay,
        quantity: parseInt(req.body.quantity),
        imageUrl: url,
      };

      const validatedIndustryData = insertIndustryProductSchema.omit({ imageUrl: true }).parse(industryData);

      const industryProduct = await storage.createIndustryProduct({
        ...validatedIndustryData,
        imageUrl: url,
        imagePublicId: publicId,
        machineType: req.body.machineType || undefined,
        purchaseDate: req.body.purchaseDate ? new Date(req.body.purchaseDate) : undefined,
        warrantyExpiry: req.body.warrantyExpiry ? new Date(req.body.warrantyExpiry) : undefined,
      });

      res.json(industryProduct);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create item" });
    }
  });

  app.patch("/api/items/:id/availability", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user || user.role !== "industry") {
        return res.status(403).json({ message: "Only industries can update item availability" });
      }

      const product = await storage.getIndustryProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (product.industryId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this item" });
      }

      const { status } = req.body;
      if (!status || (status !== 'available' && status !== 'unavailable')) {
        return res.status(400).json({ message: "Invalid status. Must be 'available' or 'unavailable'" });
      }

      const updatedProduct = await storage.updateIndustryProduct(req.params.id, { status });
      res.json(updatedProduct);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update availability" });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const product = await storage.getIndustryProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (product.industryId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this item" });
      }

      if (product.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(product.imagePublicId);
        } catch (error) {
          console.error("Failed to delete image from Cloudinary:", error);
        }
      }

      await storage.deleteIndustryProduct(req.params.id);
      res.json({ message: "Item deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to delete item" });
    }
  });

  // Machine Routes
  app.get("/api/machines", async (req, res) => {
    try {
      const machines = await storage.getMachines();
      res.json(machines);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch machines" });
    }
  });

  app.get("/api/machines/:id", async (req, res) => {
    try {
      const machine = await storage.getMachineById(req.params.id);
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }
      res.json(machine);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch machine" });
    }
  });

  app.get("/api/machines/industry/my-machines", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user || user.role !== "industry") {
        return res.status(403).json({ message: "Only industries can access this endpoint" });
      }

      const machines = await storage.getMachinesByIndustry(req.session.userId);
      res.json(machines);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch machines" });
    }
  });

  app.post("/api/machines", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user || user.role !== "industry") {
        return res.status(403).json({ message: "Only industries can create machines" });
      }

      const validatedData = insertMachineSchema.parse({
        ...req.body,
        industryId: req.session.userId,
      });

      const machine = await storage.createMachine(validatedData);
      res.json(machine);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create machine" });
    }
  });

  app.patch("/api/machines/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const machine = await storage.getMachineById(req.params.id);
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }

      if (machine.industryId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to update this machine" });
      }

      const updatedMachine = await storage.updateMachine(req.params.id, req.body);
      res.json(updatedMachine);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update machine" });
    }
  });

  app.post("/api/machines/:id/components", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const machine = await storage.getMachineById(req.params.id);
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }

      if (machine.industryId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to modify this machine" });
      }

      const { components } = req.body;
      if (!Array.isArray(components)) {
        return res.status(400).json({ message: "Components must be an array" });
      }

      await storage.deleteMachineComponentsByMachineId(req.params.id);

      const createdComponents = await Promise.all(
        components.map((component: any) => {
          const validatedComponent = insertMachineComponentSchema.parse({
            machineId: req.params.id,
            slot: component.slot,
            industryProductId: component.industryProductId,
          });
          return storage.addMachineComponent(validatedComponent);
        })
      );

      res.json({ message: "Components updated successfully", components: createdComponents });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update machine components" });
    }
  });

  app.delete("/api/machines/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const machine = await storage.getMachineById(req.params.id);
      if (!machine) {
        return res.status(404).json({ message: "Machine not found" });
      }

      if (machine.industryId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this machine" });
      }

      await storage.deleteMachine(req.params.id);
      res.json({ message: "Machine deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to delete machine" });
    }
  });

  // Rental Routes
  app.get("/api/rentals/my-rentals", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let rentals;
      if (user.role === "industry") {
        rentals = await storage.getRentalsByIndustry(req.session.userId);
      } else {
        rentals = await storage.getRentalsByUser(req.session.userId);
      }

      const rentalsWithDetails = await Promise.all(
        rentals.map(async (rental) => {
          const product = await storage.getIndustryProductById(rental.itemId);
          const renter = await storage.getUserById(rental.userId);
          
          return {
            ...rental,
            itemName: product?.name,
            userName: renter?.username,
            imageUrl: product?.imageUrl,
          };
        })
      );

      res.json(rentalsWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch rentals" });
    }
  });

  app.post("/api/rentals", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { itemId, days } = req.body;

      if (!itemId || !days || days < 1) {
        return res.status(400).json({ message: "Invalid rental data" });
      }

      const product = await storage.getIndustryProductById(itemId);
      if (!product) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (product.availableQuantity < 1) {
        return res.status(400).json({ message: "Item not available" });
      }

      const totalAmount = (parseFloat(product.pricePerDay) * days).toFixed(2);

      const rental = await storage.createRental({
        itemId,
        userId: req.session.userId,
        industryId: product.industryId,
        startDate: new Date(),
        days,
        totalAmount,
      });

      await storage.updateIndustryProduct(itemId, {
        availableQuantity: product.availableQuantity - 1,
      });

      res.json(rental);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create rental" });
    }
  });

  // Machine Parts Routes
  app.get("/api/machine-parts/types", async (req, res) => {
    try {
      const types = await storage.getAllMachineTypes();
      res.json(types);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch machine types" });
    }
  });

  app.get("/api/machine-parts/:machineType", async (req, res) => {
    try {
      const parts = await storage.getMachinePartsByType(req.params.machineType);
      res.json(parts);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch machine parts" });
    }
  });

  app.post("/api/machine-parts", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check if user is an industry
      const user = await storage.getUserById(req.session.userId);
      if (!user || user.role !== "industry") {
        return res.status(403).json({ message: "Only industries can create machine parts" });
      }

      // Validate core fields with schema
      const validatedData = insertMachinePartSchema.parse(req.body);
      
      // Validate optional position fields separately
      const positionSchema = z.object({
        positionX: z.coerce.number().int().min(0).max(100).optional(),
        positionY: z.coerce.number().int().min(0).max(100).optional(),
        diagramImageUrl: z.string().url().optional().or(z.literal("")),
      });
      
      const validatedPosition = positionSchema.parse({
        positionX: req.body.positionX,
        positionY: req.body.positionY,
        diagramImageUrl: req.body.diagramImageUrl,
      });
      
      const partData: InsertMachinePart & { positionX?: number; positionY?: number; diagramImageUrl?: string } = {
        ...validatedData,
        positionX: validatedPosition.positionX ?? undefined,
        positionY: validatedPosition.positionY ?? undefined,
        diagramImageUrl: validatedPosition.diagramImageUrl || undefined,
      };
      
      const part = await storage.createMachinePart(partData);
      res.json(part);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create machine part" });
    }
  });

  app.patch("/api/machine-parts/:id/position", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      // Check if user is an industry
      const user = await storage.getUserById(req.session.userId);
      if (!user || user.role !== "industry") {
        return res.status(403).json({ message: "Only industries can update machine parts" });
      }

      const { id } = req.params;
      const { positionX, positionY } = req.body;

      // Validate and coerce position values with Zod - strict mode requires both fields
      const positionSchema = z.object({
        positionX: z.coerce.number().int().min(0).max(100),
        positionY: z.coerce.number().int().min(0).max(100),
      }).strict();

      // Reject undefined/null values before validation
      if (positionX === undefined || positionX === null || positionY === undefined || positionY === null) {
        return res.status(400).json({ message: "Both positionX and positionY are required" });
      }

      const validatedData = positionSchema.parse({ positionX, positionY });

      const part = await storage.getMachinePartById(id);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      // Verify ownership: Part must belong to an item owned by this industry
      // Since parts are global to machine types, we need to check if this industry can modify it
      // For now, we'll allow any industry to position parts for their machine types
      // In a production system, you'd link parts to specific items/industries
      
      const updatedPart = await storage.updateMachinePartPosition(id, validatedData.positionX, validatedData.positionY);
      res.json(updatedPart);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update position" });
    }
  });

  // Health Reports Routes
  app.get("/api/health-reports/item/:itemId", async (req, res) => {
    try {
      const report = await storage.getHealthReportByItemId(req.params.itemId);
      if (!report) {
        return res.status(404).json({ message: "Health report not found" });
      }
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch health report" });
    }
  });

  app.post("/api/health-reports", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const validatedData = insertHealthReportSchema.parse(req.body);
      const report = await storage.createHealthReport(validatedData);
      res.json(report);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create health report" });
    }
  });

  // Appraisals Routes
  app.get("/api/appraisals/item/:itemId", async (req, res) => {
    try {
      const appraisal = await storage.getAppraisalByItemId(req.params.itemId);
      if (!appraisal) {
        return res.status(404).json({ message: "Appraisal not found" });
      }
      res.json(appraisal);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch appraisal" });
    }
  });

  app.post("/api/appraisals", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const validatedData = insertAppraisalSchema.parse(req.body);
      const appraisal = await storage.createAppraisal(validatedData);
      res.json(appraisal);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create appraisal" });
    }
  });

  // AI-Powered Appraisal Routes (Users Only)
  app.post("/api/ai/appraisal", upload.single("image"), async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user || user.role !== "user") {
        return res.status(403).json({ message: "This feature is only available for regular users" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Image is required for AI appraisal" });
      }

      const { itemId } = req.body;
      if (!itemId) {
        return res.status(400).json({ message: "Item ID is required" });
      }

      const item = await storage.getItemById(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      const base64Image = req.file.buffer.toString('base64');
      
      const aiResult = await analyzeItemImage(base64Image, {
        name: item.name,
        category: item.category,
        machineType: item.machineType || undefined,
        purchaseDate: item.purchaseDate || undefined,
        pricePerDay: item.pricePerDay,
      });

      if (!aiResult.estimatedValue || !aiResult.conditionScore || !aiResult.imageAnalysis) {
        return res.status(502).json({ message: "AI service returned incomplete data. Please try again." });
      }

      const appraisal = await storage.createAppraisal({
        itemId,
        appraisalMethod: 'ml_vision',
        estimatedValue: aiResult.estimatedValue.toString(),
        conditionFactor: aiResult.conditionFactor.toString(),
        ageFactor: aiResult.ageFactor.toString(),
        marketDemand: aiResult.marketDemand,
        mlConfidence: aiResult.mlConfidence.toString(),
        imageAnalysis: aiResult.imageAnalysis,
        notes: aiResult.notes,
        appraisedBy: user.username,
      });

      res.json(appraisal);
    } catch (error: any) {
      console.error("AI appraisal error:", error);
      if (error.message?.includes('AI appraisal failed')) {
        res.status(502).json({ message: "AI service is temporarily unavailable. Please try again later." });
      } else {
        res.status(500).json({ message: error.message || "AI appraisal failed" });
      }
    }
  });

  app.post("/api/ai/health-report", upload.single("image"), async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user || user.role !== "user") {
        return res.status(403).json({ message: "This feature is only available for regular users" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Image is required for AI health report" });
      }

      const { itemId } = req.body;
      if (!itemId) {
        return res.status(400).json({ message: "Item ID is required" });
      }

      const item = await storage.getItemById(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      const base64Image = req.file.buffer.toString('base64');
      
      const aiResult = await generateHealthReport(base64Image, {
        name: item.name,
        category: item.category,
        machineType: item.machineType || undefined,
        purchaseDate: item.purchaseDate || undefined,
      });

      if (!aiResult.overallCondition || !aiResult.conditionScore || !aiResult.visualInspection) {
        return res.status(502).json({ message: "AI service returned incomplete data. Please try again." });
      }

      const healthReport = await storage.createHealthReport({
        itemId,
        overallCondition: aiResult.overallCondition,
        conditionScore: aiResult.conditionScore,
        visualInspection: aiResult.visualInspection,
        functionalTest: aiResult.functionalTest,
        wearAndTear: aiResult.wearAndTear,
        defects: aiResult.defects,
        maintenanceHistory: [],
        estimatedLifeRemaining: aiResult.estimatedLifeRemaining,
        inspectedBy: `AI Assistant (${user.username})`,
      });

      res.json(healthReport);
    } catch (error: any) {
      console.error("AI health report error:", error);
      if (error.message?.includes('AI health report generation failed')) {
        res.status(502).json({ message: "AI service is temporarily unavailable. Please try again later." });
      } else {
        res.status(500).json({ message: error.message || "AI health report generation failed" });
      }
    }
  });

  // Exchanges Routes
  app.get("/api/exchanges/my-exchanges", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const offeredExchanges = await storage.getExchangesByOfferer(req.session.userId);
      const receivedExchanges = await storage.getExchangesByReceiver(req.session.userId);

      const allExchanges = [...offeredExchanges, ...receivedExchanges];

      const exchangesWithDetails = (await Promise.all(
        allExchanges.map(async (exchange) => {
          const offeredItem = await storage.getItemById(exchange.offeredItemId);
          const requestedItem = exchange.requestedItemId ? await storage.getItemById(exchange.requestedItemId) : null;
          const offerer = await storage.getUserById(exchange.offererId);
          const receiver = exchange.receiverId ? await storage.getUserById(exchange.receiverId) : null;

          if (!offeredItem || !offerer) {
            return null;
          }

          return {
            ...exchange,
            offeredItem,
            requestedItem,
            offererName: offerer.username,
            receiverName: receiver?.username,
          };
        })
      )).filter(exchange => exchange !== null);

      res.json(exchangesWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch exchanges" });
    }
  });

  app.post("/api/exchanges", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const validatedData = insertExchangeSchema.omit({ offererId: true }).parse(req.body);
      const exchange = await storage.createExchange({
        ...validatedData,
        offererId: req.session.userId,
      });

      res.json(exchange);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create exchange" });
    }
  });

  app.patch("/api/exchanges/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const exchange = await storage.updateExchange(req.params.id, req.body);
      if (!exchange) {
        return res.status(404).json({ message: "Exchange not found" });
      }

      res.json(exchange);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update exchange" });
    }
  });

  // Expert Contacts Routes
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getExpertContacts();
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch contacts" });
    }
  });

  app.get("/api/items/:itemId/parts", async (req, res) => {
    try {
      const { itemId } = req.params;
      const item = await storage.getItemById(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      const parts = await storage.getItemPartsByItemId(itemId);
      
      const partsWithRentals = await Promise.all(
        parts.map(async (part) => {
          const currentRental = await storage.getActivePartRentalByPartId(part.id);
          return {
            ...part,
            currentRental,
          };
        })
      );

      res.json(partsWithRentals);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch item parts" });
    }
  });

  app.post("/api/items/:itemId/parts", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user || user.role !== "industry") {
        return res.status(403).json({ message: "Only industries can add parts" });
      }

      const { itemId } = req.params;
      const item = await storage.getItemById(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (item.industryId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to add parts to this item" });
      }

      const validatedData = insertItemPartSchema.parse({
        ...req.body,
        itemId,
      });

      const part = await storage.createItemPart(validatedData);
      res.json(part);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create item part" });
    }
  });

  app.post("/api/part-rentals", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { itemPartId, days, pricePerDay } = req.body;

      if (!itemPartId || !days || days < 1 || !pricePerDay) {
        return res.status(400).json({ message: "Invalid rental data" });
      }

      const part = await storage.getItemPartById(itemPartId);
      if (!part) {
        return res.status(404).json({ message: "Part not found" });
      }

      if (!part.isAvailable) {
        return res.status(400).json({ message: "Part not available for rent" });
      }

      const existingRental = await storage.getActivePartRentalByPartId(itemPartId);
      if (existingRental) {
        return res.status(400).json({ message: "Part is already rented" });
      }

      const totalAmount = (parseFloat(pricePerDay) * days).toFixed(2);

      const rental = await storage.createPartRental({
        itemPartId,
        userId: req.session.userId,
        startDate: new Date(),
        days,
        pricePerDay,
        totalAmount,
      });

      await storage.updateItemPart(itemPartId, {
        isAvailable: false,
      });

      res.json(rental);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create part rental" });
    }
  });

  app.get("/api/part-rentals/my-rentals", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const rentals = await storage.getPartRentalsByUser(req.session.userId);

      const rentalsWithDetails = await Promise.all(
        rentals.map(async (rental) => {
          const part = await storage.getItemPartById(rental.itemPartId);
          if (!part) return null;

          const item = await storage.getItemById(part.itemId);
          
          return {
            ...rental,
            partName: part.partName,
            itemName: item?.name,
            partHealth: part.health,
          };
        })
      );

      res.json(rentalsWithDetails.filter(r => r !== null));
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch part rentals" });
    }
  });

  // Cart Routes
  app.get("/api/cart", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      let cart = await storage.getActiveCartByUserId(req.session.userId);
      if (!cart) {
        cart = await storage.createCart(req.session.userId);
      }

      const cartItemsList = await storage.getCartItemsByCartId(cart.id);
      
      const cartItemsWithDetails = await Promise.all(
        cartItemsList.map(async (cartItem) => {
          // Try to find in legacy items first, then industry products
          let item = await storage.getItemById(cartItem.itemId);
          if (!item) {
            item = await storage.getIndustryProductById(cartItem.itemId);
          }
          const subtotal = (parseFloat(cartItem.priceSnapshot) * cartItem.quantity * cartItem.days).toFixed(2);
          return {
            ...cartItem,
            item,
            subtotal,
          };
        })
      );

      const totalAmount = cartItemsWithDetails.reduce((sum, item) => sum + parseFloat(item.subtotal), 0).toFixed(2);

      res.json({
        ...cart,
        items: cartItemsWithDetails,
        totalAmount,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch cart" });
    }
  });

  app.post("/api/cart/items", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { itemId, quantity = 1, days = 1 } = req.body;

      if (!itemId) {
        return res.status(400).json({ message: "Item ID is required" });
      }

      // Try to find in legacy items table first
      let item = await storage.getItemById(itemId);
      let pricePerDay: string;
      let availableQty: number;

      if (!item) {
        // If not found in items, try industry products
        const industryProduct = await storage.getIndustryProductById(itemId);
        if (!industryProduct) {
          return res.status(404).json({ message: "Item not found" });
        }
        pricePerDay = industryProduct.pricePerDay;
        availableQty = industryProduct.availableQuantity;
      } else {
        pricePerDay = item.pricePerDay;
        availableQty = item.availableQuantity;
      }

      if (availableQty < quantity) {
        return res.status(400).json({ message: "Insufficient quantity available" });
      }

      let cart = await storage.getActiveCartByUserId(req.session.userId);
      if (!cart) {
        cart = await storage.createCart(req.session.userId);
      }

      const cartItem = await storage.addCartItem(
        cart.id,
        itemId,
        quantity,
        days,
        pricePerDay
      );

      res.json(cartItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to add item to cart" });
    }
  });

  app.patch("/api/cart/items/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      const { quantity, days } = req.body;

      const cartItem = await db.select().from(cartItems).where(eq(cartItems.id, id)).limit(1);
      if (!cartItem[0]) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      const cart = await storage.getCartById(cartItem[0].cartId);
      if (!cart || cart.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized to modify this cart item" });
      }

      const updates: { quantity?: number; days?: number } = {};
      if (quantity !== undefined) updates.quantity = quantity;
      if (days !== undefined) updates.days = days;

      const updatedItem = await storage.updateCartItem(id, updates);
      res.json(updatedItem);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/items/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const { id } = req.params;
      
      const cartItem = await db.select().from(cartItems).where(eq(cartItems.id, id)).limit(1);
      if (!cartItem[0]) {
        return res.status(404).json({ message: "Cart item not found" });
      }

      const cart = await storage.getCartById(cartItem[0].cartId);
      if (!cart || cart.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized to delete this cart item" });
      }

      const deleted = await storage.deleteCartItem(id);
      res.json({ message: "Cart item removed successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to remove cart item" });
    }
  });

  app.post("/api/cart/checkout", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const cart = await storage.getActiveCartByUserId(req.session.userId);
      if (!cart) {
        return res.status(404).json({ message: "Cart not found" });
      }

      if (cart.userId !== req.session.userId) {
        return res.status(403).json({ message: "Unauthorized to checkout this cart" });
      }

      const cartItemsList = await storage.getCartItemsByCartId(cart.id);
      if (cartItemsList.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const rentals = await Promise.all(
        cartItemsList.map(async (cartItem) => {
          const item = await storage.getItemById(cartItem.itemId);
          if (!item) return null;

          const totalAmount = (parseFloat(cartItem.priceSnapshot) * cartItem.quantity * cartItem.days).toFixed(2);

          const rental = await storage.createRental({
            itemId: cartItem.itemId,
            userId: req.session.userId!,
            industryId: item.industryId,
            startDate: new Date(),
            days: cartItem.days,
            totalAmount,
          });

          await storage.updateItem(item.id, {
            availableQuantity: item.availableQuantity - cartItem.quantity,
            status: item.availableQuantity - cartItem.quantity === 0 ? 'unavailable' : item.status,
          });

          return rental;
        })
      );

      await storage.updateCartStatus(cart.id, 'checked_out');

      res.json({
        message: "Checkout successful",
        rentals: rentals.filter(r => r !== null),
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Checkout failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
