import { Schema, model, Document, Types } from 'mongoose';

// User Model
export interface IUserDoc extends Document {
  _id: Types.ObjectId;
  username: string;
  email: string;
  password: string;
  role: string;
  companyName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUserDoc>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  companyName: { type: String },
}, { timestamps: true });

export const UserModel = model<IUserDoc>('User', userSchema);

// Product Model
export interface IProductDoc extends Document {
  _id: Types.ObjectId;
  name: string;
  description: string;
  category: string;
  imageUrl: string;
  imagePublicId?: string;
  machineType?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<IProductDoc>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String, required: true },
  imagePublicId: String,
  machineType: String,
  createdById: { type: String, required: true },
}, { timestamps: true });

export const ProductModel = model<IProductDoc>('Product', productSchema);

// Industry Product Model
export interface IIndustryProductDoc extends Document {
  _id: Types.ObjectId;
  productId: string;
  industryId: string;
  name: string;
  description: string;
  category: string;
  pricePerDay: string;
  quantity: number;
  availableQuantity: number;
  imageUrl: string;
  imagePublicId?: string;
  status: string;
  machineType?: string;
  parentItemId?: string;
  partPosition?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const industryProductSchema = new Schema<IIndustryProductDoc>({
  productId: { type: String, required: true },
  industryId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  pricePerDay: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  availableQuantity: { type: Number, required: true, default: 1 },
  imageUrl: { type: String, required: true },
  imagePublicId: String,
  status: { type: String, default: 'available' },
  machineType: String,
  parentItemId: String,
  partPosition: String,
  purchaseDate: Date,
  warrantyExpiry: Date,
}, { timestamps: true });

export const IndustryProductModel = model<IIndustryProductDoc>('IndustryProduct', industryProductSchema);

// Item Model (Legacy)
export interface IItemDoc extends Document {
  _id: Types.ObjectId;
  industryId: string;
  name: string;
  description: string;
  category: string;
  pricePerDay: string;
  quantity: number;
  availableQuantity: number;
  imageUrl: string;
  imagePublicId?: string;
  status: string;
  machineType?: string;
  parentItemId?: string;
  partPosition?: string;
  purchaseDate?: Date;
  warrantyExpiry?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const itemSchema = new Schema<IItemDoc>({
  industryId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  pricePerDay: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  availableQuantity: { type: Number, required: true, default: 1 },
  imageUrl: { type: String, required: true },
  imagePublicId: String,
  status: { type: String, default: 'available' },
  machineType: String,
  parentItemId: String,
  partPosition: String,
  purchaseDate: Date,
  warrantyExpiry: Date,
}, { timestamps: true });

export const ItemModel = model<IItemDoc>('Item', itemSchema);

// Rental Model
export interface IRentalDoc extends Document {
  _id: Types.ObjectId;
  userId: string;
  industryId: string;
  itemId: string;
  startDate: Date;
  endDate?: Date;
  days: number;
  totalAmount: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const rentalSchema = new Schema<IRentalDoc>({
  userId: { type: String, required: true },
  industryId: { type: String, required: true },
  itemId: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: Date,
  days: { type: Number, required: true },
  totalAmount: { type: String, required: true },
  status: { type: String, default: 'active' },
}, { timestamps: true });

export const RentalModel = model<IRentalDoc>('Rental', rentalSchema);

// Expert Contact Model
export interface IExpertContactDoc extends Document {
  _id: Types.ObjectId;
  name: string;
  role: string;
  expertise: string;
  phone: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

const expertContactSchema = new Schema<IExpertContactDoc>({
  name: { type: String, required: true },
  role: { type: String, required: true },
  expertise: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
}, { timestamps: true });

export const ExpertContactModel = model<IExpertContactDoc>('ExpertContact', expertContactSchema);

// Health Report Model
export interface IHealthReportDoc extends Document {
  _id: Types.ObjectId;
  itemId: string;
  overallCondition: string;
  conditionScore: number;
  visualInspection?: string;
  functionalTest?: string;
  wearAndTear?: string;
  defects?: string[];
  maintenanceHistory?: Array<{ date: string; description: string }>;
  estimatedLifeRemaining?: string;
  inspectedBy?: string;
  inspectionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const healthReportSchema = new Schema<IHealthReportDoc>({
  itemId: { type: String, required: true },
  overallCondition: { type: String, required: true },
  conditionScore: { type: Number, required: true },
  visualInspection: String,
  functionalTest: String,
  wearAndTear: String,
  defects: [String],
  maintenanceHistory: [{ date: String, description: String }],
  estimatedLifeRemaining: String,
  inspectedBy: String,
  inspectionDate: { type: Date, default: Date.now },
}, { timestamps: true });

export const HealthReportModel = model<IHealthReportDoc>('HealthReport', healthReportSchema);

// Appraisal Model
export interface IAppraisalDoc extends Document {
  _id: Types.ObjectId;
  itemId: string;
  appraisalMethod: string;
  estimatedValue: string;
  conditionFactor?: string;
  ageFactor?: string;
  marketDemand?: string;
  mlConfidence?: string;
  imageAnalysis?: {
    defects: string[];
    quality_score: number;
  };
  notes?: string;
  appraisedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appraisalSchema = new Schema<IAppraisalDoc>({
  itemId: { type: String, required: true },
  appraisalMethod: { type: String, required: true },
  estimatedValue: { type: String, required: true },
  conditionFactor: String,
  ageFactor: String,
  marketDemand: String,
  mlConfidence: String,
  imageAnalysis: {
    defects: [String],
    quality_score: Number,
  },
  notes: String,
  appraisedBy: String,
}, { timestamps: true });

export const AppraisalModel = model<IAppraisalDoc>('Appraisal', appraisalSchema);

// Exchange Model
export interface IExchangeDoc extends Document {
  _id: Types.ObjectId;
  offeredItemId?: string;
  requestedItemId?: string;
  offererId: string;
  receiverId?: string;
  exchangeType: string;
  cashAmount?: string;
  status: string;
  notes?: string;
  aiAnalysis?: any;
  createdAt: Date;
  updatedAt: Date;
}

const exchangeSchema = new Schema<IExchangeDoc>({
  offeredItemId: String,
  requestedItemId: String,
  offererId: { type: String, required: true },
  receiverId: String,
  exchangeType: { type: String, required: true },
  cashAmount: String,
  status: { type: String, default: 'pending' },
  notes: String,
  aiAnalysis: Schema.Types.Mixed,
}, { timestamps: true });

export const ExchangeModel = model<IExchangeDoc>('Exchange', exchangeSchema);

// Notification Model
export interface INotificationDoc extends Document {
  _id: Types.ObjectId;
  userId: string;
  title: string;
  message: string;
  type: string;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotificationDoc>({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, required: true },
  relatedId: String,
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

export const NotificationModel = model<INotificationDoc>('Notification', notificationSchema);
