import { Types, Document } from 'mongoose';
import {
  UserModel,
  ItemModel,
  RentalModel,
  HealthReportModel,
  AppraisalModel,
  ExchangeModel,
  ExpertContactModel,
  ProductModel,
  IndustryProductModel,
  NotificationModel
} from './mongo-models';
import type { IStorage } from './storage';
import type {
  User, InsertUser,
  Item, InsertItem,
  Product, InsertProduct,
  IndustryProduct, InsertIndustryProduct,
  Rental, InsertRental,
  MachinePart, InsertMachinePart,
  HealthReport, InsertHealthReport,
  Appraisal, InsertAppraisal,
  Exchange, InsertExchange,
  ExpertContact, InsertExpertContact,
  ItemPart, InsertItemPart,
  PartRental, InsertPartRental,
  Cart, InsertCart,
  CartItem, InsertCartItem,
  Machine, InsertMachine,
  MachineComponent, InsertMachineComponent,
  MachineWithComponents,
  TrackingSession, InsertTrackingSession,
  Notification, InsertNotification
} from '@shared/schema';

// Helper to convert Mongoose document to plain object with id field
function toEntity<T>(doc: any): T {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) {
    obj.id = obj._id.toString();
    delete obj._id;
  }
  delete obj.__v;
  return obj as T;
}

function toEntities<T>(docs: any[]): T[] {
  return docs.map(doc => toEntity<T>(doc));
}

export class MongoStorage implements IStorage {
  // ========== USERS (Priority: Auth) ==========
  async createUser(user: InsertUser): Promise<User> {
    const doc = await UserModel.create(user);
    return toEntity(doc);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const doc = await UserModel.findOne({ username });
    return doc ? toEntity(doc) : null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const doc = await UserModel.findOne({ email });
    return doc ? toEntity(doc) : null;
  }

  async getUserById(id: string): Promise<User | null> {
    const doc = await UserModel.findById(id);
    return doc ? toEntity(doc) : null;
  }

  // ========== PRODUCTS (Priority: Catalog) ==========
  async createProduct(product: Omit<InsertProduct, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; createdById: string; machineType?: string }): Promise<Product> {
    const doc = await ProductModel.create(product);
    return toEntity(doc);
  }

  async getProducts(): Promise<Product[]> {
    const docs = await ProductModel.find();
    return toEntities(docs);
  }

  async getProductById(id: string): Promise<Product | null> {
    const doc = await ProductModel.findById(id);
    return doc ? toEntity(doc) : null;
  }

  // ========== INDUSTRY PRODUCTS (Priority: Catalog) ==========
  async createIndustryProduct(product: Omit<InsertIndustryProduct, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; productId: string; industryId: string; machineType?: string; purchaseDate?: Date; warrantyExpiry?: Date }): Promise<IndustryProduct> {
    const doc = await IndustryProductModel.create(product);
    return toEntity(doc);
  }

  async getIndustryProducts(): Promise<IndustryProduct[]> {
    const docs = await IndustryProductModel.find();
    return toEntities(docs);
  }

  async getIndustryProductById(id: string): Promise<IndustryProduct | null> {
    const doc = await IndustryProductModel.findById(id);
    return doc ? toEntity(doc) : null;
  }

  async getIndustryProductsByIndustry(industryId: string): Promise<IndustryProduct[]> {
    const docs = await IndustryProductModel.find({ industryId });
    return toEntities(docs);
  }

  async updateIndustryProduct(id: string, updates: Partial<IndustryProduct>): Promise<IndustryProduct | null> {
    const doc = await IndustryProductModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toEntity(doc) : null;
  }

  async deleteIndustryProduct(id: string): Promise<boolean> {
    const result = await IndustryProductModel.findByIdAndDelete(id);
    return !!result;
  }

  // ========== ITEMS (Legacy - for backward compatibility) ==========
  async createItem(item: Omit<InsertItem, 'imageUrl'> & { imageUrl: string; imagePublicId?: string; industryId: string; machineType?: string; purchaseDate?: Date; warrantyExpiry?: Date }): Promise<Item> {
    const doc = await ItemModel.create(item);
    return toEntity(doc);
  }

  async getItems(): Promise<Item[]> {
    const docs = await ItemModel.find();
    return toEntities(docs);
  }

  async getItemById(id: string): Promise<Item | null> {
    const doc = await ItemModel.findById(id);
    return doc ? toEntity(doc) : null;
  }

  async getItemsByIndustry(industryId: string): Promise<Item[]> {
    const docs = await ItemModel.find({ industryId });
    return toEntities(docs);
  }

  async updateItem(id: string, updates: Partial<Item>): Promise<Item | null> {
    const doc = await ItemModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toEntity(doc) : null;
  }

  async deleteItem(id: string): Promise<boolean> {
    const result = await ItemModel.findByIdAndDelete(id);
    return !!result;
  }

  // ========== RENTALS (Priority: Core functionality) ==========
  async createRental(rental: InsertRental): Promise<Rental> {
    const doc = await RentalModel.create(rental);
    return toEntity(doc);
  }

  async getAllRentals(): Promise<Rental[]> {
    const docs = await RentalModel.find();
    return toEntities(docs);
  }

  async getAllRentalsWithDetails(): Promise<any[]> {
    const docs = await RentalModel.find()
      .populate('userId')
      .populate('industryId')
      .populate('itemId');
    return toEntities(docs);
  }

  async getRentalById(id: string): Promise<Rental | null> {
    const doc = await RentalModel.findById(id);
    return doc ? toEntity(doc) : null;
  }

  async getRentalByIdWithDetails(id: string): Promise<any | null> {
    const doc = await RentalModel.findById(id)
      .populate('userId')
      .populate('industryId')
      .populate('itemId');
    return doc ? toEntity(doc) : null;
  }

  async getRentalsByIndustry(industryId: string): Promise<Rental[]> {
    const docs = await RentalModel.find({ industryId });
    return toEntities(docs);
  }

  async getRentalsByUser(userId: string): Promise<Rental[]> {
    const docs = await RentalModel.find({ userId });
    return toEntities(docs);
  }

  async updateRental(id: string, updates: Partial<Rental>): Promise<Rental | null> {
    const doc = await RentalModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toEntity(doc) : null;
  }

  // ========== EXPERT CONTACTS (Priority: MVP feature) ==========
  async createExpertContact(contact: InsertExpertContact): Promise<ExpertContact> {
    const doc = await ExpertContactModel.create(contact);
    return toEntity(doc);
  }

  async getExpertContacts(): Promise<ExpertContact[]> {
    const docs = await ExpertContactModel.find();
    return toEntities(docs);
  }

  async getExpertContactById(id: string): Promise<ExpertContact | null> {
    const doc = await ExpertContactModel.findById(id);
    return doc ? toEntity(doc) : null;
  }

  // ========== NOTIFICATIONS (Priority: Core UX) ==========
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const doc = await NotificationModel.create(notification);
    return toEntity(doc);
  }

  async getNotificationsByUser(userId: string): Promise<Notification[]> {
    const docs = await NotificationModel.find({ userId }).sort({ createdAt: -1 });
    return toEntities(docs);
  }

  async getUnreadNotificationsByUser(userId: string): Promise<Notification[]> {
    const docs = await NotificationModel.find({ userId, isRead: false }).sort({ createdAt: -1 });
    return toEntities(docs);
  }

  async markNotificationAsRead(id: string, userId: string): Promise<Notification | null> {
    const doc = await NotificationModel.findOneAndUpdate(
      { _id: id, userId },
      { isRead: true },
      { new: true }
    );
    return doc ? toEntity(doc) : null;
  }

  async markAllNotificationsAsRead(userId: string): Promise<boolean> {
    const result = await NotificationModel.updateMany(
      { userId, isRead: false },
      { isRead: true }
    );
    return result.modifiedCount > 0;
  }

  async deleteNotification(id: string, userId: string): Promise<boolean> {
    const result = await NotificationModel.findOneAndDelete({ _id: id, userId });
    return !!result;
  }

  // ========== HEALTH REPORTS ==========
  async createHealthReport(report: InsertHealthReport): Promise<HealthReport> {
    const doc = await HealthReportModel.create(report);
    return toEntity(doc);
  }

  async getHealthReportByItemId(itemId: string): Promise<HealthReport | null> {
    const doc = await HealthReportModel.findOne({ itemId }).sort({ createdAt: -1 });
    return doc ? toEntity(doc) : null;
  }

  async getHealthReportsByIndustry(industryId: string): Promise<HealthReport[]> {
    const docs = await HealthReportModel.find({ industryId });
    return toEntities(docs);
  }

  // ========== APPRAISALS ==========
  async createAppraisal(appraisal: InsertAppraisal): Promise<Appraisal> {
    const doc = await AppraisalModel.create(appraisal);
    return toEntity(doc);
  }

  async getAppraisalByItemId(itemId: string): Promise<Appraisal | null> {
    const doc = await AppraisalModel.findOne({ itemId }).sort({ createdAt: -1 });
    return doc ? toEntity(doc) : null;
  }

  async getAppraisalsByIndustry(industryId: string): Promise<Appraisal[]> {
    const docs = await AppraisalModel.find({ industryId });
    return toEntities(docs);
  }

  // ========== EXCHANGES ==========
  async createExchange(exchange: InsertExchange): Promise<Exchange> {
    const doc = await ExchangeModel.create(exchange);
    return toEntity(doc);
  }

  async getExchangeById(id: string): Promise<Exchange | null> {
    const doc = await ExchangeModel.findById(id);
    return doc ? toEntity(doc) : null;
  }

  async getExchangesByOfferer(offererId: string): Promise<Exchange[]> {
    const docs = await ExchangeModel.find({ offererId });
    return toEntities(docs);
  }

  async getExchangesByReceiver(receiverId: string): Promise<Exchange[]> {
    const docs = await ExchangeModel.find({ receiverId });
    return toEntities(docs);
  }

  async updateExchange(id: string, updates: Partial<Exchange>): Promise<Exchange | null> {
    const doc = await ExchangeModel.findByIdAndUpdate(id, updates, { new: true });
    return doc ? toEntity(doc) : null;
  }

  // ========== STUBBED METHODS (Not implemented yet) ==========
  async createOrUpdateRentalQrCode(qrCode: { rentalId: string; qrCodeData: any; qrImageUrl: string }): Promise<any> {
    console.warn('createOrUpdateRentalQrCode not implemented in MongoStorage');
    throw new Error('QR Code functionality not implemented');
  }

  async getRentalQrCodeByRentalId(rentalId: string): Promise<any | null> {
    console.warn('getRentalQrCodeByRentalId not implemented in MongoStorage');
    return null;
  }

  async createMachinePart(part: InsertMachinePart & { positionX?: number; positionY?: number; diagramImageUrl?: string }): Promise<MachinePart> {
    console.warn('createMachinePart not implemented in MongoStorage');
    throw new Error('Machine Parts functionality not implemented');
  }

  async getMachinePartsByType(machineType: string): Promise<MachinePart[]> {
    console.warn('getMachinePartsByType not implemented in MongoStorage');
    return [];
  }

  async getMachinePartById(id: string): Promise<MachinePart | null> {
    console.warn('getMachinePartById not implemented in MongoStorage');
    return null;
  }

  async getAllMachineTypes(): Promise<string[]> {
    console.warn('getAllMachineTypes not implemented in MongoStorage');
    return [];
  }

  async updateMachinePartPosition(id: string, positionX: number, positionY: number): Promise<MachinePart | null> {
    console.warn('updateMachinePartPosition not implemented in MongoStorage');
    return null;
  }

  async createItemPart(part: InsertItemPart): Promise<ItemPart> {
    console.warn('createItemPart not implemented in MongoStorage');
    throw new Error('Item Parts functionality not implemented');
  }

  async getItemPartsByItemId(itemId: string): Promise<ItemPart[]> {
    console.warn('getItemPartsByItemId not implemented in MongoStorage');
    return [];
  }

  async getItemPartById(id: string): Promise<ItemPart | null> {
    console.warn('getItemPartById not implemented in MongoStorage');
    return null;
  }

  async updateItemPart(id: string, updates: Partial<ItemPart>): Promise<ItemPart | null> {
    console.warn('updateItemPart not implemented in MongoStorage');
    return null;
  }

  async deleteItemPart(id: string): Promise<boolean> {
    console.warn('deleteItemPart not implemented in MongoStorage');
    return false;
  }

  async createPartRental(rental: InsertPartRental): Promise<PartRental> {
    console.warn('createPartRental not implemented in MongoStorage');
    throw new Error('Part Rentals functionality not implemented');
  }

  async getPartRentalsByItem(itemId: string): Promise<PartRental[]> {
    console.warn('getPartRentalsByItem not implemented in MongoStorage');
    return [];
  }

  async getPartRentalsByUser(userId: string): Promise<PartRental[]> {
    console.warn('getPartRentalsByUser not implemented in MongoStorage');
    return [];
  }

  async getPartRentalById(id: string): Promise<PartRental | null> {
    console.warn('getPartRentalById not implemented in MongoStorage');
    return null;
  }

  async updatePartRental(id: string, updates: Partial<PartRental>): Promise<PartRental | null> {
    console.warn('updatePartRental not implemented in MongoStorage');
    return null;
  }

  async getActivePartRentalByPartId(partId: string): Promise<PartRental | null> {
    console.warn('getActivePartRentalByPartId not implemented in MongoStorage');
    return null;
  }

  async getOrCreateCart(userId: string): Promise<Cart> {
    console.warn('getOrCreateCart not implemented in MongoStorage');
    throw new Error('Cart functionality not implemented');
  }

  async getCartByUser(userId: string): Promise<Cart | null> {
    console.warn('getCartByUser not implemented in MongoStorage');
    return null;
  }

  async getActiveCartByUserId(userId: string): Promise<Cart | null> {
    console.warn('getActiveCartByUserId not implemented in MongoStorage');
    return null;
  }

  async getCartById(id: string): Promise<Cart | null> {
    console.warn('getCartById not implemented in MongoStorage');
    return null;
  }

  async createCart(userId: string): Promise<Cart> {
    console.warn('createCart not implemented in MongoStorage');
    throw new Error('Cart functionality not implemented');
  }

  async updateCartStatus(id: string, status: string): Promise<Cart | null> {
    console.warn('updateCartStatus not implemented in MongoStorage');
    return null;
  }

  async deleteCart(id: string): Promise<boolean> {
    console.warn('deleteCart not implemented in MongoStorage');
    return false;
  }

  async addCartItem(cartId: string, itemId: string, quantity: number, days: number, priceSnapshot: string): Promise<CartItem> {
    console.warn('addCartItem not implemented in MongoStorage');
    throw new Error('Cart functionality not implemented');
  }

  async getCartItems(cartId: string): Promise<CartItem[]> {
    console.warn('getCartItems not implemented in MongoStorage');
    return [];
  }

  async getCartItemsByCartId(cartId: string): Promise<CartItem[]> {
    console.warn('getCartItemsByCartId not implemented in MongoStorage');
    return [];
  }

  async getCartItemById(id: string): Promise<CartItem | null> {
    console.warn('getCartItemById not implemented in MongoStorage');
    return null;
  }

  async updateCartItem(id: string, updates: Partial<CartItem>): Promise<CartItem | null> {
    console.warn('updateCartItem not implemented in MongoStorage');
    return null;
  }

  async deleteCartItem(id: string): Promise<boolean> {
    console.warn('deleteCartItem not implemented in MongoStorage');
    return false;
  }

  async clearCart(cartId: string): Promise<boolean> {
    console.warn('clearCart not implemented in MongoStorage');
    return false;
  }

  async createMachine(machine: InsertMachine): Promise<Machine> {
    console.warn('createMachine not implemented in MongoStorage');
    throw new Error('Machine functionality not implemented');
  }

  async getMachines(): Promise<Machine[]> {
    console.warn('getMachines not implemented in MongoStorage');
    return [];
  }

  async getMachinesByIndustry(industryId: string): Promise<Machine[]> {
    console.warn('getMachinesByIndustry not implemented in MongoStorage');
    return [];
  }

  async getMachineById(id: string): Promise<Machine | null> {
    console.warn('getMachineById not implemented in MongoStorage');
    return null;
  }

  async getMachineWithComponents(id: string): Promise<MachineWithComponents | null> {
    console.warn('getMachineWithComponents not implemented in MongoStorage');
    return null;
  }

  async updateMachine(id: string, updates: Partial<Machine>): Promise<Machine | null> {
    console.warn('updateMachine not implemented in MongoStorage');
    return null;
  }

  async deleteMachine(id: string): Promise<boolean> {
    console.warn('deleteMachine not implemented in MongoStorage');
    return false;
  }

  async createMachineComponent(component: InsertMachineComponent): Promise<MachineComponent> {
    console.warn('createMachineComponent not implemented in MongoStorage');
    throw new Error('Machine Components functionality not implemented');
  }

  async getMachineComponents(machineId: string): Promise<MachineComponent[]> {
    console.warn('getMachineComponents not implemented in MongoStorage');
    return [];
  }

  async getMachineComponentsByMachineId(machineId: string): Promise<MachineComponent[]> {
    console.warn('getMachineComponentsByMachineId not implemented in MongoStorage');
    return [];
  }

  async getMachineComponentById(id: string): Promise<MachineComponent | null> {
    console.warn('getMachineComponentById not implemented in MongoStorage');
    return null;
  }

  async updateMachineComponent(id: string, updates: Partial<MachineComponent>): Promise<MachineComponent | null> {
    console.warn('updateMachineComponent not implemented in MongoStorage');
    return null;
  }

  async deleteMachineComponent(id: string): Promise<boolean> {
    console.warn('deleteMachineComponent not implemented in MongoStorage');
    return false;
  }

  async deleteMachineComponentsByMachineId(machineId: string): Promise<boolean> {
    console.warn('deleteMachineComponentsByMachineId not implemented in MongoStorage');
    return false;
  }

  async createTrackingSession(rentalId: string, userId: string, industryId: string, itemId: string): Promise<TrackingSession> {
    console.warn('createTrackingSession not implemented in MongoStorage');
    throw new Error('Tracking functionality not implemented');
  }

  async getTrackingSessionByRentalId(rentalId: string): Promise<TrackingSession | null> {
    console.warn('getTrackingSessionByRentalId not implemented in MongoStorage');
    return null;
  }

  async getTrackingSessionsByRental(rentalId: string): Promise<TrackingSession[]> {
    console.warn('getTrackingSessionsByRental not implemented in MongoStorage');
    return [];
  }

  async getActiveTrackingSession(rentalId: string): Promise<TrackingSession | null> {
    console.warn('getActiveTrackingSession not implemented in MongoStorage');
    return null;
  }

  async getActiveTrackingSessionsByUserId(userId: string): Promise<TrackingSession[]> {
    console.warn('getActiveTrackingSessionsByUserId not implemented in MongoStorage');
    return [];
  }

  async getActiveTrackingSessionsByIndustryId(industryId: string): Promise<TrackingSession[]> {
    console.warn('getActiveTrackingSessionsByIndustryId not implemented in MongoStorage');
    return [];
  }

  async updateTrackingSession(id: string, updates: Partial<TrackingSession>): Promise<TrackingSession | null> {
    console.warn('updateTrackingSession not implemented in MongoStorage');
    return null;
  }
}
