import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { eq, desc } from "drizzle-orm";
import { users, items, rentals, type User, type InsertUser, type Item, type InsertItem, type Rental, type InsertRental } from "@shared/schema";

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
  createItem(item: Omit<InsertItem, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; industryId: string }): Promise<Item>;
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
  async createItem(item: Omit<InsertItem, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; industryId: string }): Promise<Item> {
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
}

export const storage = new PostgresStorage();
