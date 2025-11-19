import mongoose from "mongoose";
import { type User, type InsertUser, type Item, type InsertItem, type Rental, type InsertRental } from "@shared/schema";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: ['user', 'industry'] },
  companyName: { type: String },
  createdAt: { type: Date, default: Date.now },
});

const ItemSchema = new mongoose.Schema({
  industryId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  pricePerDay: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  availableQuantity: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  imagePublicId: { type: String },
  status: { type: String, required: true, default: 'available' },
  createdAt: { type: Date, default: Date.now },
});

const RentalSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  userId: { type: String, required: true },
  industryId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  days: { type: Number, required: true },
  totalAmount: { type: String, required: true },
  status: { type: String, required: true, default: 'active' },
  createdAt: { type: Date, default: Date.now },
});

const UserModel = mongoose.model('User', UserSchema);
const ItemModel = mongoose.model('Item', ItemSchema);
const RentalModel = mongoose.model('Rental', RentalSchema);

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

export class MongoStorage implements IStorage {
  // Users
  async createUser(user: InsertUser): Promise<User> {
    const newUser = await UserModel.create(user);
    return this.toPlainUser(newUser);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const user = await UserModel.findOne({ username });
    return user ? this.toPlainUser(user) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? this.toPlainUser(user) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await UserModel.findById(id);
    return user ? this.toPlainUser(user) : null;
  }

  // Items
  async createItem(item: Omit<InsertItem, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; industryId: string }): Promise<Item> {
    const newItem = await ItemModel.create({
      ...item,
      availableQuantity: item.quantity,
    });
    return this.toPlainItem(newItem);
  }

  async getItems(): Promise<Item[]> {
    const items = await ItemModel.find().sort({ createdAt: -1 });
    return items.map(item => this.toPlainItem(item));
  }

  async getItemById(id: string): Promise<Item | null> {
    const item = await ItemModel.findById(id);
    return item ? this.toPlainItem(item) : null;
  }

  async getItemsByIndustry(industryId: string): Promise<Item[]> {
    const items = await ItemModel.find({ industryId }).sort({ createdAt: -1 });
    return items.map(item => this.toPlainItem(item));
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item | null> {
    const item = await ItemModel.findByIdAndUpdate(id, updates, { new: true });
    return item ? this.toPlainItem(item) : null;
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await ItemModel.findByIdAndDelete(id);
    return !!result;
  }

  // Rentals
  async createRental(rental: InsertRental): Promise<Rental> {
    const newRental = await RentalModel.create(rental);
    return this.toPlainRental(newRental);
  }

  async getRentalsByIndustry(industryId: string): Promise<Rental[]> {
    const rentals = await RentalModel.find({ industryId }).sort({ createdAt: -1 });
    return rentals.map(rental => this.toPlainRental(rental));
  }

  async getRentalsByUser(userId: string): Promise<Rental[]> {
    const rentals = await RentalModel.find({ userId }).sort({ createdAt: -1 });
    return rentals.map(rental => this.toPlainRental(rental));
  }

  async updateRental(id: string, updates: Partial<Rental>): Promise<Rental | null> {
    const rental = await RentalModel.findByIdAndUpdate(id, updates, { new: true });
    return rental ? this.toPlainRental(rental) : null;
  }

  // Helper methods
  private toPlainUser(doc: any): User {
    return {
      id: doc._id.toString(),
      username: doc.username,
      email: doc.email,
      password: doc.password,
      role: doc.role,
      companyName: doc.companyName,
      createdAt: doc.createdAt,
    };
  }

  private toPlainItem(doc: any): Item {
    return {
      id: doc._id.toString(),
      industryId: doc.industryId,
      name: doc.name,
      description: doc.description,
      category: doc.category,
      pricePerDay: doc.pricePerDay,
      quantity: doc.quantity,
      availableQuantity: doc.availableQuantity,
      imageUrl: doc.imageUrl,
      imagePublicId: doc.imagePublicId,
      status: doc.status,
      createdAt: doc.createdAt,
    };
  }

  private toPlainRental(doc: any): Rental {
    return {
      id: doc._id.toString(),
      itemId: doc.itemId,
      userId: doc.userId,
      industryId: doc.industryId,
      startDate: doc.startDate,
      endDate: doc.endDate,
      days: doc.days,
      totalAmount: doc.totalAmount,
      status: doc.status,
      createdAt: doc.createdAt,
    };
  }
}

export const storage = new MongoStorage();
