import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { eq, desc } from "drizzle-orm";
import { 
  users, items, rentals, machineParts, healthReports, appraisals, exchanges, repairRequests,
  type User, type InsertUser, 
  type Item, type InsertItem, 
  type Rental, type InsertRental,
  type MachinePart, type InsertMachinePart,
  type HealthReport, type InsertHealthReport,
  type Appraisal, type InsertAppraisal,
  type Exchange, type InsertExchange,
  type RepairRequest, type InsertRepairRequest
} from "@shared/schema";

const DATABASE_URL = process.env.DATABASE_URL || "";

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

neonConfig.webSocketConstructor = ws;
const pool = new Pool({ connectionString: DATABASE_URL });
const db = drizzle({ client: pool });

export interface IStorage {
  // Users
  createUser(user: InsertUser): Promise<User>;
  getUserByUsername(username: string): Promise<User | null>;
  getUserByEmail(email: string): Promise<User | null>;
  getUserById(id: string): Promise<User | null>;

  // Items
  createItem(item: Omit<InsertItem, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; industryId: string; machineType?: string; purchaseDate?: Date; warrantyExpiry?: Date }): Promise<Item>;
  getItems(): Promise<Item[]>;
  getItemById(id: string): Promise<Item | null>;
  getItemsByIndustry(industryId: string): Promise<Item[]>;
  updateItem(id: string, updates: Partial<Item>): Promise<Item | null>;
  deleteItem(id: string): Promise<boolean>;

  // Rentals
  createRental(rental: InsertRental): Promise<Rental>;
  getRentalsByIndustry(industryId: string): Promise<Rental[]>;
  getRentalsByUser(userId: string): Promise<Rental[]>;
  updateRental(id: string, updates: Partial<Rental>): Promise<Rental | null>;

  // Machine Parts
  createMachinePart(part: InsertMachinePart & { positionX?: number; positionY?: number; diagramImageUrl?: string }): Promise<MachinePart>;
  getMachinePartsByType(machineType: string): Promise<MachinePart[]>;
  getMachinePartById(id: string): Promise<MachinePart | null>;
  getAllMachineTypes(): Promise<string[]>;

  // Health Reports
  createHealthReport(report: InsertHealthReport): Promise<HealthReport>;
  getHealthReportByItemId(itemId: string): Promise<HealthReport | null>;
  getHealthReportsByIndustry(industryId: string): Promise<HealthReport[]>;

  // Appraisals
  createAppraisal(appraisal: InsertAppraisal): Promise<Appraisal>;
  getAppraisalByItemId(itemId: string): Promise<Appraisal | null>;
  getAppraisalsByIndustry(industryId: string): Promise<Appraisal[]>;

  // Exchanges
  createExchange(exchange: InsertExchange): Promise<Exchange>;
  getExchangeById(id: string): Promise<Exchange | null>;
  getExchangesByOfferer(offererId: string): Promise<Exchange[]>;
  getExchangesByReceiver(receiverId: string): Promise<Exchange[]>;
  updateExchange(id: string, updates: Partial<Exchange>): Promise<Exchange | null>;

  // Repair Requests
  createRepairRequest(request: InsertRepairRequest): Promise<RepairRequest>;
  getRepairRequestById(id: string): Promise<RepairRequest | null>;
  getRepairRequestsByUser(userId: string): Promise<RepairRequest[]>;
  getRepairRequestsByIndustry(industryId: string): Promise<RepairRequest[]>;
  updateRepairRequest(id: string, updates: Partial<RepairRequest>): Promise<RepairRequest | null>;
}

export class PostgresStorage implements IStorage {
  // Users
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user || null;
  }

  async getUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user || null;
  }

  // Items
  async createItem(item: Omit<InsertItem, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; industryId: string; machineType?: string; purchaseDate?: Date; warrantyExpiry?: Date }): Promise<Item> {
    const [newItem] = await db.insert(items).values({
      ...item,
      availableQuantity: item.quantity,
    }).returning();
    return newItem;
  }

  async getItems(): Promise<Item[]> {
    return await db.select().from(items).orderBy(desc(items.createdAt));
  }

  async getItemById(id: string): Promise<Item | null> {
    const [item] = await db.select().from(items).where(eq(items.id, id)).limit(1);
    return item || null;
  }

  async getItemsByIndustry(industryId: string): Promise<Item[]> {
    return await db.select().from(items).where(eq(items.industryId, industryId)).orderBy(desc(items.createdAt));
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item | null> {
    const [updatedItem] = await db.update(items).set(updates).where(eq(items.id, id)).returning();
    return updatedItem || null;
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await db.delete(items).where(eq(items.id, id)).returning();
    return result.length > 0;
  }

  // Rentals
  async createRental(rental: InsertRental): Promise<Rental> {
    const [newRental] = await db.insert(rentals).values(rental).returning();
    return newRental;
  }

  async getRentalsByIndustry(industryId: string): Promise<Rental[]> {
    return await db.select().from(rentals).where(eq(rentals.industryId, industryId)).orderBy(desc(rentals.createdAt));
  }

  async getRentalsByUser(userId: string): Promise<Rental[]> {
    return await db.select().from(rentals).where(eq(rentals.userId, userId)).orderBy(desc(rentals.createdAt));
  }

  async updateRental(id: string, updates: Partial<Rental>): Promise<Rental | null> {
    const [updatedRental] = await db.update(rentals).set(updates).where(eq(rentals.id, id)).returning();
    return updatedRental || null;
  }

  // Machine Parts
  async createMachinePart(part: InsertMachinePart & { positionX?: number; positionY?: number; diagramImageUrl?: string }): Promise<MachinePart> {
    const [newPart] = await db.insert(machineParts).values(part).returning();
    return newPart;
  }

  async getMachinePartsByType(machineType: string): Promise<MachinePart[]> {
    return await db.select().from(machineParts).where(eq(machineParts.machineType, machineType)).orderBy(desc(machineParts.createdAt));
  }

  async getMachinePartById(id: string): Promise<MachinePart | null> {
    const [part] = await db.select().from(machineParts).where(eq(machineParts.id, id)).limit(1);
    return part || null;
  }

  async getAllMachineTypes(): Promise<string[]> {
    const results = await db.selectDistinct({ machineType: machineParts.machineType }).from(machineParts);
    return results.map(r => r.machineType).filter(Boolean);
  }

  // Health Reports
  async createHealthReport(report: InsertHealthReport): Promise<HealthReport> {
    const [newReport] = await db.insert(healthReports).values(report).returning();
    return newReport;
  }

  async getHealthReportByItemId(itemId: string): Promise<HealthReport | null> {
    const [report] = await db.select().from(healthReports).where(eq(healthReports.itemId, itemId)).orderBy(desc(healthReports.createdAt)).limit(1);
    return report || null;
  }

  async getHealthReportsByIndustry(industryId: string): Promise<HealthReport[]> {
    const itemsInIndustry = await this.getItemsByIndustry(industryId);
    const itemIds = itemsInIndustry.map(item => item.id);
    if (itemIds.length === 0) return [];
    
    const reports = await db.select().from(healthReports).orderBy(desc(healthReports.createdAt));
    return reports.filter(report => itemIds.includes(report.itemId));
  }

  // Appraisals
  async createAppraisal(appraisal: InsertAppraisal): Promise<Appraisal> {
    const [newAppraisal] = await db.insert(appraisals).values(appraisal).returning();
    return newAppraisal;
  }

  async getAppraisalByItemId(itemId: string): Promise<Appraisal | null> {
    const [appraisal] = await db.select().from(appraisals).where(eq(appraisals.itemId, itemId)).orderBy(desc(appraisals.createdAt)).limit(1);
    return appraisal || null;
  }

  async getAppraisalsByIndustry(industryId: string): Promise<Appraisal[]> {
    const itemsInIndustry = await this.getItemsByIndustry(industryId);
    const itemIds = itemsInIndustry.map(item => item.id);
    if (itemIds.length === 0) return [];
    
    const appraisalResults = await db.select().from(appraisals).orderBy(desc(appraisals.createdAt));
    return appraisalResults.filter(appraisal => itemIds.includes(appraisal.itemId));
  }

  // Exchanges
  async createExchange(exchange: InsertExchange): Promise<Exchange> {
    const [newExchange] = await db.insert(exchanges).values(exchange).returning();
    return newExchange;
  }

  async getExchangeById(id: string): Promise<Exchange | null> {
    const [exchange] = await db.select().from(exchanges).where(eq(exchanges.id, id)).limit(1);
    return exchange || null;
  }

  async getExchangesByOfferer(offererId: string): Promise<Exchange[]> {
    return await db.select().from(exchanges).where(eq(exchanges.offererId, offererId)).orderBy(desc(exchanges.createdAt));
  }

  async getExchangesByReceiver(receiverId: string): Promise<Exchange[]> {
    return await db.select().from(exchanges).where(eq(exchanges.receiverId, receiverId)).orderBy(desc(exchanges.createdAt));
  }

  async updateExchange(id: string, updates: Partial<Exchange>): Promise<Exchange | null> {
    const [updatedExchange] = await db.update(exchanges).set(updates).where(eq(exchanges.id, id)).returning();
    return updatedExchange || null;
  }

  // Repair Requests
  async createRepairRequest(request: InsertRepairRequest): Promise<RepairRequest> {
    const [newRequest] = await db.insert(repairRequests).values(request).returning();
    return newRequest;
  }

  async getRepairRequestById(id: string): Promise<RepairRequest | null> {
    const [request] = await db.select().from(repairRequests).where(eq(repairRequests.id, id)).limit(1);
    return request || null;
  }

  async getRepairRequestsByUser(userId: string): Promise<RepairRequest[]> {
    return await db.select().from(repairRequests).where(eq(repairRequests.userId, userId)).orderBy(desc(repairRequests.createdAt));
  }

  async getRepairRequestsByIndustry(industryId: string): Promise<RepairRequest[]> {
    return await db.select().from(repairRequests).where(eq(repairRequests.industryId, industryId)).orderBy(desc(repairRequests.createdAt));
  }

  async updateRepairRequest(id: string, updates: Partial<RepairRequest>): Promise<RepairRequest | null> {
    const [updatedRequest] = await db.update(repairRequests).set(updates).where(eq(repairRequests.id, id)).returning();
    return updatedRequest || null;
  }
}

export const storage = new PostgresStorage();
