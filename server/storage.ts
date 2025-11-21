import { drizzle } from "drizzle-orm/neon-serverless";
import { Pool, neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { eq, desc, and } from "drizzle-orm";
import { 
  users, items, rentals, machineParts, healthReports, appraisals, exchanges, expertContacts, itemParts, partRentals, carts, cartItems, products, industryProducts, machines, machineComponents, trackingSessions, notifications,
  type User, type InsertUser, 
  type Item, type InsertItem, 
  type Product, type InsertProduct,
  type IndustryProduct, type InsertIndustryProduct,
  type Rental, type InsertRental,
  type MachinePart, type InsertMachinePart,
  type HealthReport, type InsertHealthReport,
  type Appraisal, type InsertAppraisal,
  type Exchange, type InsertExchange,
  type ExpertContact, type InsertExpertContact,
  type ItemPart, type InsertItemPart,
  type PartRental, type InsertPartRental,
  type Cart, type InsertCart,
  type CartItem, type InsertCartItem,
  type Machine, type InsertMachine,
  type MachineComponent, type InsertMachineComponent,
  type MachineWithComponents,
  type TrackingSession, type InsertTrackingSession,
  type Notification, type InsertNotification
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

  // Products (common catalog)
  createProduct(product: Omit<InsertProduct, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; createdById: string; machineType?: string }): Promise<Product>;
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | null>;

  // Industry Products (editable copies)
  createIndustryProduct(product: Omit<InsertIndustryProduct, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; productId: string; industryId: string; machineType?: string; purchaseDate?: Date; warrantyExpiry?: Date }): Promise<IndustryProduct>;
  getIndustryProducts(): Promise<IndustryProduct[]>;
  getIndustryProductById(id: string): Promise<IndustryProduct | null>;
  getIndustryProductsByIndustry(industryId: string): Promise<IndustryProduct[]>;
  updateIndustryProduct(id: string, updates: Partial<IndustryProduct>): Promise<IndustryProduct | null>;
  deleteIndustryProduct(id: string): Promise<boolean>;

  // Items (legacy - for backward compatibility)
  createItem(item: Omit<InsertItem, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; industryId: string; machineType?: string; purchaseDate?: Date; warrantyExpiry?: Date }): Promise<Item>;
  getItems(): Promise<Item[]>;
  getItemById(id: string): Promise<Item | null>;
  getItemsByIndustry(industryId: string): Promise<Item[]>;
  updateItem(id: string, updates: Partial<Item>): Promise<Item | null>;
  deleteItem(id: string): Promise<boolean>;

  // Rentals
  createRental(rental: InsertRental): Promise<Rental>;
  getAllRentals(): Promise<Rental[]>;
  getAllRentalsWithDetails(): Promise<any[]>;
  getRentalById(id: string): Promise<Rental | null>;
  getRentalByIdWithDetails(id: string): Promise<any | null>;
  getRentalsByIndustry(industryId: string): Promise<Rental[]>;
  getRentalsByUser(userId: string): Promise<Rental[]>;
  updateRental(id: string, updates: Partial<Rental>): Promise<Rental | null>;
  
  // Rental QR Codes
  createOrUpdateRentalQrCode(qrCode: { rentalId: string; qrCodeData: any; qrImageUrl: string }): Promise<any>;
  getRentalQrCodeByRentalId(rentalId: string): Promise<any | null>;

  // Machine Parts
  createMachinePart(part: InsertMachinePart & { positionX?: number; positionY?: number; diagramImageUrl?: string }): Promise<MachinePart>;
  getMachinePartsByType(machineType: string): Promise<MachinePart[]>;
  getMachinePartById(id: string): Promise<MachinePart | null>;
  getAllMachineTypes(): Promise<string[]>;
  updateMachinePartPosition(id: string, positionX: number, positionY: number): Promise<MachinePart | null>;

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

  // Expert Contacts
  createExpertContact(contact: InsertExpertContact): Promise<ExpertContact>;
  getExpertContacts(): Promise<ExpertContact[]>;
  getExpertContactById(id: string): Promise<ExpertContact | null>;

  // Notifications
  createNotification(notification: InsertNotification): Promise<Notification>;
  getNotificationsByUser(userId: string): Promise<Notification[]>;
  getUnreadNotificationsByUser(userId: string): Promise<Notification[]>;
  markNotificationAsRead(id: string, userId: string): Promise<Notification | null>;
  markAllNotificationsAsRead(userId: string): Promise<boolean>;
  deleteNotification(id: string, userId: string): Promise<boolean>;

  // Item Parts
  createItemPart(part: InsertItemPart): Promise<ItemPart>;
  getItemPartsByItemId(itemId: string): Promise<ItemPart[]>;
  getItemPartById(id: string): Promise<ItemPart | null>;
  updateItemPart(id: string, updates: Partial<ItemPart>): Promise<ItemPart | null>;
  deleteItemPart(id: string): Promise<boolean>;

  // Part Rentals
  createPartRental(rental: InsertPartRental): Promise<PartRental>;
  getPartRentalsByUser(userId: string): Promise<PartRental[]>;
  getActivePartRentalByPartId(itemPartId: string): Promise<PartRental | null>;
  updatePartRental(id: string, updates: Partial<PartRental>): Promise<PartRental | null>;

  // Carts
  createCart(userId: string): Promise<Cart>;
  getActiveCartByUserId(userId: string): Promise<Cart | null>;
  getCartById(id: string): Promise<Cart | null>;
  updateCartStatus(id: string, status: string): Promise<Cart | null>;

  // Cart Items
  addCartItem(cartId: string, itemId: string, quantity: number, days: number, priceSnapshot: string): Promise<CartItem>;
  getCartItemsByCartId(cartId: string): Promise<CartItem[]>;
  updateCartItem(id: string, updates: { quantity?: number; days?: number }): Promise<CartItem | null>;
  deleteCartItem(id: string): Promise<boolean>;

  // Machines
  createMachine(machine: Omit<InsertMachine, 'status'>): Promise<Machine>;
  getMachines(): Promise<Machine[]>;
  getMachineById(id: string): Promise<MachineWithComponents | null>;
  getMachinesByIndustry(industryId: string): Promise<Machine[]>;
  updateMachine(id: string, updates: Partial<Machine>): Promise<Machine | null>;
  deleteMachine(id: string): Promise<boolean>;

  // Machine Components
  addMachineComponent(component: InsertMachineComponent): Promise<MachineComponent>;
  getMachineComponentsByMachineId(machineId: string): Promise<MachineComponent[]>;
  deleteMachineComponent(id: string): Promise<boolean>;
  deleteMachineComponentsByMachineId(machineId: string): Promise<boolean>;

  // Tracking Sessions
  createTrackingSession(rentalId: string, userId: string, industryId: string, itemId: string): Promise<TrackingSession>;
  getTrackingSessionByRentalId(rentalId: string): Promise<TrackingSession | null>;
  getActiveTrackingSessionsByUserId(userId: string): Promise<TrackingSession[]>;
  getActiveTrackingSessionsByIndustryId(industryId: string): Promise<TrackingSession[]>;
  updateTrackingSession(id: string, updates: Partial<TrackingSession>): Promise<TrackingSession | null>;
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

  // Products (common catalog)
  async createProduct(product: Omit<InsertProduct, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; createdById: string; machineType?: string }): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).orderBy(desc(products.createdAt));
  }

  async getProductById(id: string): Promise<Product | null> {
    const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return product || null;
  }

  // Industry Products (editable copies)
  async createIndustryProduct(product: Omit<InsertIndustryProduct, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; productId: string; industryId: string; machineType?: string; purchaseDate?: Date; warrantyExpiry?: Date }): Promise<IndustryProduct> {
    const [newProduct] = await db.insert(industryProducts).values({
      ...product,
      availableQuantity: product.quantity,
    }).returning();
    return newProduct;
  }

  async getIndustryProducts(): Promise<IndustryProduct[]> {
    return await db.select().from(industryProducts).orderBy(desc(industryProducts.createdAt));
  }

  async getIndustryProductById(id: string): Promise<IndustryProduct | null> {
    const [product] = await db.select().from(industryProducts).where(eq(industryProducts.id, id)).limit(1);
    return product || null;
  }

  async getIndustryProductsByIndustry(industryId: string): Promise<IndustryProduct[]> {
    return await db.select().from(industryProducts).where(eq(industryProducts.industryId, industryId)).orderBy(desc(industryProducts.createdAt));
  }

  async updateIndustryProduct(id: string, updates: Partial<IndustryProduct>): Promise<IndustryProduct | null> {
    const [updatedProduct] = await db.update(industryProducts).set(updates).where(eq(industryProducts.id, id)).returning();
    return updatedProduct || null;
  }

  async deleteIndustryProduct(id: string): Promise<boolean> {
    const result = await db.delete(industryProducts).where(eq(industryProducts.id, id)).returning();
    return result.length > 0;
  }

  // Items (legacy)
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

  async getAllRentals(): Promise<Rental[]> {
    return await db.select().from(rentals).orderBy(desc(rentals.createdAt));
  }

  async getAllRentalsWithDetails(): Promise<any[]> {
    const allRentals = await db.select().from(rentals).orderBy(desc(rentals.createdAt));
    
    const rentalsWithDetails = await Promise.all(
      allRentals.map(async (rental) => {
        const product = await this.getIndustryProductById(rental.itemId);
        const renter = await this.getUserById(rental.userId);
        const industry = await this.getUserById(rental.industryId);
        
        return {
          ...rental,
          itemName: product?.name || 'Unknown Item',
          itemImageUrl: product?.imageUrl || '',
          userName: renter?.username || 'Unknown User',
          industryName: industry?.companyName || industry?.username || 'Unknown Industry',
          pricePerDay: product?.pricePerDay || '0',
        };
      })
    );
    
    return rentalsWithDetails;
  }

  async getRentalById(id: string): Promise<Rental | null> {
    const [rental] = await db.select().from(rentals).where(eq(rentals.id, id)).limit(1);
    return rental || null;
  }

  async getRentalByIdWithDetails(id: string): Promise<any | null> {
    const rental = await this.getRentalById(id);
    if (!rental) return null;
    
    const product = await this.getIndustryProductById(rental.itemId);
    const renter = await this.getUserById(rental.userId);
    const industry = await this.getUserById(rental.industryId);
    
    return {
      ...rental,
      itemName: product?.name || 'Unknown Item',
      itemImageUrl: product?.imageUrl || '',
      userName: renter?.username || 'Unknown User',
      industryName: industry?.companyName || industry?.username || 'Unknown Industry',
      pricePerDay: product?.pricePerDay || '0',
    };
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
  
  // Rental QR Codes
  async createOrUpdateRentalQrCode(qrCode: { rentalId: string; qrCodeData: any; qrImageUrl: string }): Promise<any> {
    const { rentalQrCodes } = await import("@shared/schema");
    const existing = await db.select().from(rentalQrCodes).where(eq(rentalQrCodes.rentalId, qrCode.rentalId)).limit(1);
    
    if (existing.length > 0) {
      const [updated] = await db.update(rentalQrCodes)
        .set({ qrCodeData: qrCode.qrCodeData, qrImageUrl: qrCode.qrImageUrl })
        .where(eq(rentalQrCodes.rentalId, qrCode.rentalId))
        .returning();
      return updated;
    } else {
      const [created] = await db.insert(rentalQrCodes).values(qrCode).returning();
      return created;
    }
  }

  async getRentalQrCodeByRentalId(rentalId: string): Promise<any | null> {
    const { rentalQrCodes } = await import("@shared/schema");
    const [qrCode] = await db.select().from(rentalQrCodes).where(eq(rentalQrCodes.rentalId, rentalId)).limit(1);
    return qrCode || null;
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

  async updateMachinePartPosition(id: string, positionX: number, positionY: number): Promise<MachinePart | null> {
    const [updatedPart] = await db.update(machineParts)
      .set({ positionX, positionY })
      .where(eq(machineParts.id, id))
      .returning();
    return updatedPart || null;
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

  // Expert Contacts
  async createExpertContact(contact: InsertExpertContact): Promise<ExpertContact> {
    const [newContact] = await db.insert(expertContacts).values(contact).returning();
    return newContact;
  }

  async getExpertContacts(): Promise<ExpertContact[]> {
    return await db.select().from(expertContacts).orderBy(expertContacts.role);
  }

  async getExpertContactById(id: string): Promise<ExpertContact | null> {
    const [contact] = await db.select().from(expertContacts).where(eq(expertContacts.id, id)).limit(1);
    return contact || null;
  }

  // Notifications
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db.insert(notifications).values(notification).returning();
    return newNotification;
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
  }

  async getUnreadNotificationsByUser(userId: string): Promise<Notification[]> {
    return await db.select().from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationAsRead(id: string, userId: string): Promise<Notification | null> {
    const [updatedNotification] = await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return updatedNotification || null;
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    await db.update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return true;
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await db.delete(notifications)
      .where(and(eq(notifications.id, id), eq(notifications.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // Item Parts
  async createItemPart(part: InsertItemPart): Promise<ItemPart> {
    const [newPart] = await db.insert(itemParts).values(part).returning();
    return newPart;
  }

  async getItemPartsByItemId(itemId: string): Promise<ItemPart[]> {
    return await db.select().from(itemParts).where(eq(itemParts.itemId, itemId)).orderBy(desc(itemParts.createdAt));
  }

  async getItemPartById(id: string): Promise<ItemPart | null> {
    const [part] = await db.select().from(itemParts).where(eq(itemParts.id, id)).limit(1);
    return part || null;
  }

  async updateItemPart(id: string, updates: Partial<ItemPart>): Promise<ItemPart | null> {
    const [updatedPart] = await db.update(itemParts).set(updates).where(eq(itemParts.id, id)).returning();
    return updatedPart || null;
  }

  async deleteItemPart(id: string): Promise<boolean> {
    const result = await db.delete(itemParts).where(eq(itemParts.id, id)).returning();
    return result.length > 0;
  }

  // Part Rentals
  async createPartRental(rental: InsertPartRental): Promise<PartRental> {
    const [newRental] = await db.insert(partRentals).values(rental).returning();
    return newRental;
  }

  async getPartRentalsByUser(userId: string): Promise<PartRental[]> {
    return await db.select().from(partRentals).where(eq(partRentals.userId, userId)).orderBy(desc(partRentals.createdAt));
  }

  async getActivePartRentalByPartId(itemPartId: string): Promise<PartRental | null> {
    const [rental] = await db.select().from(partRentals)
      .where(and(
        eq(partRentals.itemPartId, itemPartId),
        eq(partRentals.status, 'active')
      ))
      .limit(1);
    return rental || null;
  }

  async updatePartRental(id: string, updates: Partial<PartRental>): Promise<PartRental | null> {
    const [updatedRental] = await db.update(partRentals).set(updates).where(eq(partRentals.id, id)).returning();
    return updatedRental || null;
  }

  // Carts
  async createCart(userId: string): Promise<Cart> {
    const [newCart] = await db.insert(carts).values({ userId }).returning();
    return newCart;
  }

  async getActiveCartByUserId(userId: string): Promise<Cart | null> {
    const [cart] = await db.select().from(carts)
      .where(and(
        eq(carts.userId, userId),
        eq(carts.status, 'active')
      ))
      .limit(1);
    return cart || null;
  }

  async getCartById(id: string): Promise<Cart | null> {
    const [cart] = await db.select().from(carts).where(eq(carts.id, id)).limit(1);
    return cart || null;
  }

  async updateCartStatus(id: string, status: string): Promise<Cart | null> {
    const [updatedCart] = await db.update(carts).set({ status }).where(eq(carts.id, id)).returning();
    return updatedCart || null;
  }

  // Cart Items
  async addCartItem(cartId: string, itemId: string, quantity: number, days: number, priceSnapshot: string): Promise<CartItem> {
    const [newCartItem] = await db.insert(cartItems).values({
      cartId,
      itemId,
      quantity,
      days,
      priceSnapshot,
    }).returning();
    return newCartItem;
  }

  async getCartItemsByCartId(cartId: string): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.cartId, cartId)).orderBy(desc(cartItems.createdAt));
  }

  async updateCartItem(id: string, updates: { quantity?: number; days?: number }): Promise<CartItem | null> {
    const [updatedItem] = await db.update(cartItems).set(updates).where(eq(cartItems.id, id)).returning();
    return updatedItem || null;
  }

  async deleteCartItem(id: string): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id)).returning();
    return result.length > 0;
  }

  // Machines
  async createMachine(machine: Omit<InsertMachine, 'status'>): Promise<Machine> {
    const [newMachine] = await db.insert(machines).values(machine).returning();
    return newMachine;
  }

  async getMachines(): Promise<Machine[]> {
    return await db.select().from(machines).orderBy(desc(machines.createdAt));
  }

  async getMachineById(id: string): Promise<MachineWithComponents | null> {
    const [machine] = await db.select().from(machines).where(eq(machines.id, id)).limit(1);
    if (!machine) return null;

    const components = await db.select().from(machineComponents)
      .where(eq(machineComponents.machineId, id));

    const componentsWithProducts = await Promise.all(
      components.map(async (component) => {
        const [product] = await db.select().from(industryProducts)
          .where(eq(industryProducts.id, component.industryProductId))
          .limit(1);
        return {
          ...component,
          product: product || undefined,
        };
      })
    );

    return {
      ...machine,
      components: componentsWithProducts,
    };
  }

  async getMachinesByIndustry(industryId: string): Promise<Machine[]> {
    return await db.select().from(machines)
      .where(eq(machines.industryId, industryId))
      .orderBy(desc(machines.createdAt));
  }

  async updateMachine(id: string, updates: Partial<Machine>): Promise<Machine | null> {
    const [updatedMachine] = await db.update(machines).set(updates).where(eq(machines.id, id)).returning();
    return updatedMachine || null;
  }

  async deleteMachine(id: string): Promise<boolean> {
    await this.deleteMachineComponentsByMachineId(id);
    const result = await db.delete(machines).where(eq(machines.id, id)).returning();
    return result.length > 0;
  }

  // Machine Components
  async addMachineComponent(component: InsertMachineComponent): Promise<MachineComponent> {
    const [newComponent] = await db.insert(machineComponents).values(component).returning();
    return newComponent;
  }

  async getMachineComponentsByMachineId(machineId: string): Promise<MachineComponent[]> {
    return await db.select().from(machineComponents)
      .where(eq(machineComponents.machineId, machineId));
  }

  async deleteMachineComponent(id: string): Promise<boolean> {
    const result = await db.delete(machineComponents).where(eq(machineComponents.id, id)).returning();
    return result.length > 0;
  }

  async deleteMachineComponentsByMachineId(machineId: string): Promise<boolean> {
    const result = await db.delete(machineComponents)
      .where(eq(machineComponents.machineId, machineId))
      .returning();
    return result.length > 0;
  }

  // Tracking Sessions
  async createTrackingSession(rentalId: string, userId: string, industryId: string, itemId: string): Promise<TrackingSession> {
    const [session] = await db.insert(trackingSessions).values({
      rentalId,
      userId,
      industryId,
      itemId,
    }).returning();
    return session;
  }

  async getTrackingSessionByRentalId(rentalId: string): Promise<TrackingSession | null> {
    const [session] = await db.select().from(trackingSessions)
      .where(and(
        eq(trackingSessions.rentalId, rentalId),
        eq(trackingSessions.status, 'active')
      ))
      .limit(1);
    return session || null;
  }

  async getActiveTrackingSessionsByUserId(userId: string): Promise<TrackingSession[]> {
    return await db.select().from(trackingSessions)
      .where(and(
        eq(trackingSessions.userId, userId),
        eq(trackingSessions.status, 'active')
      ))
      .orderBy(desc(trackingSessions.createdAt));
  }

  async getActiveTrackingSessionsByIndustryId(industryId: string): Promise<TrackingSession[]> {
    return await db.select().from(trackingSessions)
      .where(and(
        eq(trackingSessions.industryId, industryId),
        eq(trackingSessions.status, 'active')
      ))
      .orderBy(desc(trackingSessions.createdAt));
  }

  async updateTrackingSession(id: string, updates: Partial<TrackingSession>): Promise<TrackingSession | null> {
    const [updated] = await db.update(trackingSessions)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(trackingSessions.id, id))
      .returning();
    return updated || null;
  }
}

export const storage = new PostgresStorage();
