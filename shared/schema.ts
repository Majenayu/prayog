import { sql } from "drizzle-orm";
import { pgTable, text, varchar, decimal, integer, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull(), // 'user' or 'industry'
  companyName: text("company_name"), // for industry users
  createdAt: timestamp("created_at").defaultNow(),
});

// Common product catalog - shared reference data that all users can view
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  imageUrl: text("image_url").notNull(),
  imagePublicId: text("image_public_id"),
  machineType: text("machine_type"),
  createdById: text("created_by_id").notNull(), // Industry that first created this product
  createdAt: timestamp("created_at").defaultNow(),
});

// Industry-specific product copies - editable by each industry
export const industryProducts = pgTable("industry_products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: text("product_id").notNull(), // Reference to products table
  industryId: text("industry_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  availableQuantity: integer("available_quantity").notNull().default(1),
  imageUrl: text("image_url").notNull(),
  imagePublicId: text("image_public_id"),
  status: text("status").notNull().default('available'), // 'available', 'on_rent', 'unavailable'
  machineType: text("machine_type"),
  parentItemId: text("parent_item_id"),
  partPosition: text("part_position"),
  purchaseDate: timestamp("purchase_date"),
  warrantyExpiry: timestamp("warranty_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Legacy items table - keep for backward compatibility, will migrate data
export const items = pgTable("items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  industryId: text("industry_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  availableQuantity: integer("available_quantity").notNull().default(1),
  imageUrl: text("image_url").notNull(),
  imagePublicId: text("image_public_id"),
  status: text("status").notNull().default('available'), // 'available', 'on_rent', 'unavailable'
  machineType: text("machine_type"), // Type of machine if this is a machine
  parentItemId: text("parent_item_id"), // If this is a part, reference to the main machine
  partPosition: text("part_position"), // Position: 'top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'
  purchaseDate: timestamp("purchase_date"), // When item was purchased
  warrantyExpiry: timestamp("warranty_expiry"), // When warranty expires
  createdAt: timestamp("created_at").defaultNow(),
});

export const carts = pgTable("carts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(),
  status: text("status").notNull().default('active'), // 'active', 'checked_out', 'abandoned'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const cartItems = pgTable("cart_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cartId: text("cart_id").notNull(),
  itemId: text("item_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  days: integer("days").notNull().default(1), // Rental duration
  priceSnapshot: decimal("price_snapshot", { precision: 10, scale: 2 }).notNull(), // Price at time of adding to cart
  createdAt: timestamp("created_at").defaultNow(),
});

export const machineParts = pgTable("machine_parts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  machineType: text("machine_type").notNull(), // e.g., "CNC Machine", "Hydraulic Press"
  partName: text("part_name").notNull(),
  partNumber: text("part_number"),
  description: text("description").notNull(),
  location: text("location").notNull(), // e.g., "Front panel, top-left", "Inside chamber"
  imageUrl: text("image_url"), // Diagram showing location
  positionX: integer("position_x"), // X coordinate for visual diagram (percentage or pixels)
  positionY: integer("position_y"), // Y coordinate for visual diagram (percentage or pixels)
  diagramImageUrl: text("diagram_image_url"), // Image of the specific part for diagram
  health: integer("health").default(100), // 0-100 health score
  isAvailable: boolean("is_available").default(true), // Whether part is available for rent
  createdAt: timestamp("created_at").defaultNow(),
});

export const itemParts = pgTable("item_parts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: text("item_id").notNull(), // Reference to specific machine item
  partName: text("part_name").notNull(),
  partNumber: text("part_number"),
  description: text("description").notNull(),
  location: text("location").notNull(), // Position: 'top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'
  health: integer("health").default(100), // 0-100 health score
  isAvailable: boolean("is_available").default(true), // Whether this specific part is available
  positionX: integer("position_x"), // X coordinate for visual diagram
  positionY: integer("position_y"), // Y coordinate for visual diagram
  imageUrl: text("image_url"), // Image of the part
  createdAt: timestamp("created_at").defaultNow(),
});

export const partRentals = pgTable("part_rentals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemPartId: text("item_part_id").notNull(), // Reference to specific item part
  userId: text("user_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  days: integer("days").notNull(),
  pricePerDay: decimal("price_per_day", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default('active'), // 'active', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
});

export const healthReports = pgTable("health_reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: text("item_id").notNull(),
  overallCondition: text("overall_condition").notNull(), // 'excellent', 'good', 'fair', 'poor'
  conditionScore: integer("condition_score").notNull(), // 0-100
  visualInspection: text("visual_inspection"), // Notes from visual inspection
  functionalTest: text("functional_test"), // Notes from functional testing
  wearAndTear: text("wear_and_tear"), // Wear and tear assessment
  defects: json("defects").$type<string[]>(), // List of detected defects
  maintenanceHistory: json("maintenance_history").$type<{date: string, description: string}[]>(), // Maintenance records
  estimatedLifeRemaining: text("estimated_life_remaining"), // e.g., "2 years", "500 hours"
  inspectedBy: text("inspected_by"),
  inspectionDate: timestamp("inspection_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const appraisals = pgTable("appraisals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: text("item_id").notNull(),
  appraisalMethod: text("appraisal_method").notNull(), // 'ml_vision', 'manual', 'hybrid'
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }).notNull(),
  conditionFactor: decimal("condition_factor", { precision: 3, scale: 2 }), // 0.00-1.00
  ageFactor: decimal("age_factor", { precision: 3, scale: 2 }), // 0.00-1.00
  marketDemand: text("market_demand"), // 'high', 'medium', 'low'
  mlConfidence: decimal("ml_confidence", { precision: 3, scale: 2 }), // ML model confidence
  imageAnalysis: json("image_analysis").$type<{defects: string[], quality_score: number}>(),
  notes: text("notes"),
  appraisedBy: text("appraised_by"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exchanges = pgTable("exchanges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  offeredItemId: text("offered_item_id").notNull(), // Item being offered
  requestedItemId: text("requested_item_id"), // Item requested in exchange (null if cash)
  offererId: text("offerer_id").notNull(), // User making the offer
  receiverId: text("receiver_id"), // User receiving the offer
  exchangeType: text("exchange_type").notNull(), // 'item_for_item', 'item_for_cash', 'both'
  cashAmount: decimal("cash_amount", { precision: 10, scale: 2 }), // Cash involved
  status: text("status").notNull().default('pending'), // 'pending', 'accepted', 'rejected', 'completed'
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rentals = pgTable("rentals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: text("item_id").notNull(),
  userId: text("user_id").notNull(),
  industryId: text("industry_id").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  days: integer("days").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default('active'), // 'active', 'completed', 'cancelled'
  createdAt: timestamp("created_at").defaultNow(),
});

export const repairRequests = pgTable("repair_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  itemId: text("item_id").notNull(),
  userId: text("user_id").notNull(),
  industryId: text("industry_id").notNull(),
  issueDescription: text("issue_description").notNull(),
  urgency: text("urgency").notNull(), // 'low', 'medium', 'high', 'critical'
  status: text("status").notNull().default('pending'), // 'pending', 'in_progress', 'completed', 'cancelled'
  estimatedCost: decimal("estimated_cost", { precision: 10, scale: 2 }),
  actualCost: decimal("actual_cost", { precision: 10, scale: 2 }),
  notes: text("notes"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
}).extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(['user', 'industry']),
  companyName: z.string().optional(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  imageUrl: z.string().url("Valid image URL required"),
});

export const insertIndustryProductSchema = createInsertSchema(industryProducts).omit({
  id: true,
  createdAt: true,
  availableQuantity: true,
}).extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  pricePerDay: z.string().min(1, "Price is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  imageUrl: z.string().url("Valid image URL required"),
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  availableQuantity: true,
}).extend({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(2, "Category is required"),
  pricePerDay: z.string().min(1, "Price is required"),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  imageUrl: z.string().url("Valid image URL required"),
});

export const insertRentalSchema = createInsertSchema(rentals).omit({
  id: true,
  createdAt: true,
  endDate: true,
  status: true,
}).extend({
  days: z.number().min(1, "Rental period must be at least 1 day"),
});

export const insertMachinePartSchema = createInsertSchema(machineParts).omit({
  id: true,
  createdAt: true,
});

export const insertItemPartSchema = createInsertSchema(itemParts).omit({
  id: true,
  createdAt: true,
}).extend({
  location: z.enum(['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'], {
    errorMap: () => ({ message: "Location must be one of: top-left, top-right, middle-left, middle-right, bottom-left, bottom-right" })
  }),
});

export const insertPartRentalSchema = createInsertSchema(partRentals).omit({
  id: true,
  createdAt: true,
  endDate: true,
  status: true,
});

export const insertHealthReportSchema = createInsertSchema(healthReports).omit({
  id: true,
  createdAt: true,
  inspectionDate: true,
});

export const insertAppraisalSchema = createInsertSchema(appraisals).omit({
  id: true,
  createdAt: true,
});

export const insertExchangeSchema = createInsertSchema(exchanges).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertRepairRequestSchema = createInsertSchema(repairRequests).omit({
  id: true,
  createdAt: true,
  completedAt: true,
  status: true,
  userId: true,
  industryId: true,
}).extend({
  issueDescription: z.string().min(10, "Issue description must be at least 10 characters"),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
});

export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
}).extend({
  quantity: z.number().min(1, "Quantity must be at least 1"),
  days: z.number().min(1, "Rental period must be at least 1 day"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertIndustryProduct = z.infer<typeof insertIndustryProductSchema>;
export type IndustryProduct = typeof industryProducts.$inferSelect;

export type InsertItem = z.infer<typeof insertItemSchema>;
export type Item = typeof items.$inferSelect;

export type InsertRental = z.infer<typeof insertRentalSchema>;
export type Rental = typeof rentals.$inferSelect;

export type InsertMachinePart = z.infer<typeof insertMachinePartSchema>;
export type MachinePart = typeof machineParts.$inferSelect;

export type InsertItemPart = z.infer<typeof insertItemPartSchema>;
export type ItemPart = typeof itemParts.$inferSelect;

export type InsertPartRental = z.infer<typeof insertPartRentalSchema>;
export type PartRental = typeof partRentals.$inferSelect;

export type InsertHealthReport = z.infer<typeof insertHealthReportSchema>;
export type HealthReport = typeof healthReports.$inferSelect;

export type InsertAppraisal = z.infer<typeof insertAppraisalSchema>;
export type Appraisal = typeof appraisals.$inferSelect;

export type InsertExchange = z.infer<typeof insertExchangeSchema>;
export type Exchange = typeof exchanges.$inferSelect;

export type InsertRepairRequest = z.infer<typeof insertRepairRequestSchema>;
export type RepairRequest = typeof repairRequests.$inferSelect;

export type InsertCart = z.infer<typeof insertCartSchema>;
export type Cart = typeof carts.$inferSelect;

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;

// Extended types for API responses
export type ItemWithIndustry = Item & {
  industryName?: string;
};

export type RentalWithDetails = Rental & {
  itemName?: string;
  userName?: string;
  imageUrl?: string;
};

export type ItemWithHealth = Item & {
  healthReport?: HealthReport;
  appraisal?: Appraisal;
};

export type ExchangeWithDetails = Exchange & {
  offeredItem?: Item;
  requestedItem?: Item;
  offererName?: string;
  receiverName?: string;
};

export type RepairRequestWithDetails = RepairRequest & {
  itemName?: string;
  userName?: string;
  imageUrl?: string;
};

export type ItemWithParts = Item & {
  parts?: Item[]; // Parts are also items with parentItemId set
  healthReport?: HealthReport;
};

export type ItemPartWithRental = ItemPart & {
  currentRental?: PartRental;
};

export type CartWithItems = Cart & {
  items?: (CartItem & { item?: Item })[];
  totalAmount?: string;
};

export type CartItemWithDetails = CartItem & {
  item?: Item;
  subtotal?: string;
};
