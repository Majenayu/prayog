import type { Express } from "express";
import { createServer, type Server } from "http";
import express from "express";
import session from "express-session";
import bcrypt from "bcryptjs";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import { storage } from "./storage";
import { insertUserSchema, insertItemSchema, insertMachinePartSchema, insertHealthReportSchema, insertAppraisalSchema, insertExchangeSchema, insertRepairRequestSchema } from "@shared/schema";
import { analyzeItemImage, generateHealthReport } from "./openai-service";

const upload = multer({ storage: multer.memoryStorage() });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
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
      const items = await storage.getItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch items" });
    }
  });

  app.get("/api/items/my-items", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const items = await storage.getItemsByIndustry(req.session.userId);
      res.json(items);
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

      const itemData = {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        pricePerDay: req.body.pricePerDay,
        quantity: parseInt(req.body.quantity),
        imageUrl: url,
      };

      const validatedData = insertItemSchema.omit({ imageUrl: true }).parse(itemData);

      const item = await storage.createItem({
        ...validatedData,
        imageUrl: url,
        imagePublicId: publicId,
        industryId: req.session.userId,
        machineType: validatedData.machineType || undefined,
        purchaseDate: validatedData.purchaseDate || undefined,
        warrantyExpiry: validatedData.warrantyExpiry || undefined,
      });

      res.json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create item" });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const item = await storage.getItemById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (item.industryId !== req.session.userId) {
        return res.status(403).json({ message: "Not authorized to delete this item" });
      }

      if (item.imagePublicId) {
        try {
          await cloudinary.uploader.destroy(item.imagePublicId);
        } catch (error) {
          console.error("Failed to delete image from Cloudinary:", error);
        }
      }

      await storage.deleteItem(req.params.id);
      res.json({ message: "Item deleted successfully" });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to delete item" });
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
          const item = await storage.getItemById(rental.itemId);
          const renter = await storage.getUserById(rental.userId);
          
          return {
            ...rental,
            itemName: item?.name,
            userName: renter?.username,
            imageUrl: item?.imageUrl,
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

      const item = await storage.getItemById(itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      if (item.availableQuantity < 1) {
        return res.status(400).json({ message: "Item not available" });
      }

      const totalAmount = (parseFloat(item.pricePerDay) * days).toFixed(2);

      const rental = await storage.createRental({
        itemId,
        userId: req.session.userId,
        industryId: item.industryId,
        startDate: new Date(),
        days,
        totalAmount,
      });

      await storage.updateItem(itemId, {
        availableQuantity: item.availableQuantity - 1,
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

      const validatedData = insertMachinePartSchema.parse(req.body);
      const part = await storage.createMachinePart(validatedData);
      res.json(part);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create machine part" });
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

  // Repair Requests Routes
  app.get("/api/repairs/my-requests", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let repairs;
      if (user.role === "industry") {
        repairs = await storage.getRepairRequestsByIndustry(req.session.userId);
      } else {
        repairs = await storage.getRepairRequestsByUser(req.session.userId);
      }

      const repairsWithDetails = (await Promise.all(
        repairs.map(async (repair) => {
          const item = await storage.getItemById(repair.itemId);
          const requestUser = await storage.getUserById(repair.userId);

          if (!item) {
            return null;
          }

          return {
            ...repair,
            itemName: item.name,
            userName: requestUser?.username,
            imageUrl: item.imageUrl,
          };
        })
      )).filter(repair => repair !== null);

      res.json(repairsWithDetails);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch repair requests" });
    }
  });

  app.post("/api/repairs", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const validatedData = insertRepairRequestSchema.parse(req.body);
      
      const item = await storage.getItemById(validatedData.itemId);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }

      const repair = await storage.createRepairRequest({
        ...validatedData,
        userId: req.session.userId,
        industryId: item.industryId,
      });

      res.json(repair);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to create repair request" });
    }
  });

  app.patch("/api/repairs/:id", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }

      const user = await storage.getUserById(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const existingRepair = await storage.getRepairRequestById(req.params.id);
      if (!existingRepair) {
        return res.status(404).json({ message: "Repair request not found" });
      }

      if (user.role === "industry") {
        if (existingRepair.industryId !== req.session.userId) {
          return res.status(403).json({ message: "Not authorized to update this repair request" });
        }
      } else {
        if (existingRepair.userId !== req.session.userId) {
          return res.status(403).json({ message: "Not authorized to update this repair request" });
        }
        const allowedFields = ['notes'];
        const hasDisallowedFields = Object.keys(req.body).some(key => !allowedFields.includes(key));
        if (hasDisallowedFields) {
          return res.status(403).json({ message: "Users can only update notes field" });
        }
      }

      const repair = await storage.updateRepairRequest(req.params.id, req.body);
      if (!repair) {
        return res.status(404).json({ message: "Repair request not found" });
      }

      res.json(repair);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Failed to update repair request" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
