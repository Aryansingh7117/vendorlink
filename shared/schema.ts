import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['vendor', 'supplier', 'both']);

// Order status enum
export const orderStatusEnum = pgEnum('order_status', ['pending', 'processing', 'in_transit', 'delivered', 'cancelled']);

// Group order status enum
export const groupOrderStatusEnum = pgEnum('group_order_status', ['active', 'completed', 'cancelled']);

// User storage table.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: userRoleEnum("role").notNull().default('vendor'),
  businessName: varchar("business_name"),
  address: text("address"),
  city: varchar("city"),
  state: varchar("state"),
  pincode: varchar("pincode"),
  phone: varchar("phone"),
  creditScore: integer("credit_score").default(600),
  isVerified: boolean("is_verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Product categories
export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Products table
export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: varchar("supplier_id").notNull().references(() => users.id),
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  name: varchar("name").notNull(),
  description: text("description"),
  unit: varchar("unit").notNull(), // kg, L, piece, etc.
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  availableQuantity: integer("available_quantity").notNull().default(0),
  minimumOrderQuantity: integer("minimum_order_quantity").default(1),
  imageUrl: varchar("image_url"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => users.id),
  supplierId: varchar("supplier_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  pricePerUnit: decimal("price_per_unit", { precision: 10, scale: 2 }).notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: orderStatusEnum("status").notNull().default('pending'),
  deliveryAddress: text("delivery_address"),
  expectedDeliveryDate: timestamp("expected_delivery_date"),
  actualDeliveryDate: timestamp("actual_delivery_date"),
  notes: text("notes"),
  groupOrderId: varchar("group_order_id").references(() => groupOrders.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group orders table
export const groupOrders = pgTable("group_orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  organizerId: varchar("organizer_id").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  targetQuantity: integer("target_quantity").notNull(),
  currentQuantity: integer("current_quantity").default(0),
  maxParticipants: integer("max_participants").default(10),
  currentParticipants: integer("current_participants").default(0),
  regularPricePerUnit: decimal("regular_price_per_unit", { precision: 10, scale: 2 }).notNull(),
  groupPricePerUnit: decimal("group_price_per_unit", { precision: 10, scale: 2 }).notNull(),
  deadline: timestamp("deadline").notNull(),
  status: groupOrderStatusEnum("status").notNull().default('active'),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group order participants
export const groupOrderParticipants = pgTable("group_order_participants", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  groupOrderId: varchar("group_order_id").notNull().references(() => groupOrders.id),
  vendorId: varchar("vendor_id").notNull().references(() => users.id),
  quantity: integer("quantity").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Reviews table
export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderId: varchar("order_id").notNull().references(() => orders.id),
  vendorId: varchar("vendor_id").notNull().references(() => users.id),
  supplierId: varchar("supplier_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Product reviews table
export const productReviews = pgTable("product_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  productId: varchar("product_id").notNull().references(() => products.id),
  vendorId: varchar("vendor_id").notNull().references(() => users.id),
  supplierId: varchar("supplier_id").notNull().references(() => users.id),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment"),
  helpfulCount: integer("helpful_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Support tickets table
export const supportTickets = pgTable("support_tickets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  subject: varchar("subject").notNull(),
  description: text("description").notNull(),
  priority: varchar("priority").notNull().default('medium'), // low, medium, high, urgent
  status: varchar("status").notNull().default('open'), // open, in_progress, resolved, closed
  category: varchar("category").notNull(), // technical, billing, general, feedback
  assignedTo: varchar("assigned_to"),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Price alerts table
export const priceAlerts = pgTable("price_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vendorId: varchar("vendor_id").notNull().references(() => users.id),
  productId: varchar("product_id").notNull().references(() => products.id),
  targetPrice: decimal("target_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  suppliedProducts: many(products),
  vendorOrders: many(orders, { relationName: "vendorOrders" }),
  supplierOrders: many(orders, { relationName: "supplierOrders" }),
  organizedGroupOrders: many(groupOrders),
  groupOrderParticipations: many(groupOrderParticipants),
  vendorReviews: many(reviews, { relationName: "vendorReviews" }),
  supplierReviews: many(reviews, { relationName: "supplierReviews" }),
  priceAlerts: many(priceAlerts),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  supplier: one(users, {
    fields: [products.supplierId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  orders: many(orders),
  groupOrders: many(groupOrders),
  priceAlerts: many(priceAlerts),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  vendor: one(users, {
    fields: [orders.vendorId],
    references: [users.id],
    relationName: "vendorOrders",
  }),
  supplier: one(users, {
    fields: [orders.supplierId],
    references: [users.id],
    relationName: "supplierOrders",
  }),
  product: one(products, {
    fields: [orders.productId],
    references: [products.id],
  }),
  groupOrder: one(groupOrders, {
    fields: [orders.groupOrderId],
    references: [groupOrders.id],
  }),
  reviews: many(reviews),
}));

export const groupOrdersRelations = relations(groupOrders, ({ one, many }) => ({
  product: one(products, {
    fields: [groupOrders.productId],
    references: [products.id],
  }),
  organizer: one(users, {
    fields: [groupOrders.organizerId],
    references: [users.id],
  }),
  participants: many(groupOrderParticipants),
  orders: many(orders),
}));

export const groupOrderParticipantsRelations = relations(groupOrderParticipants, ({ one }) => ({
  groupOrder: one(groupOrders, {
    fields: [groupOrderParticipants.groupOrderId],
    references: [groupOrders.id],
  }),
  vendor: one(users, {
    fields: [groupOrderParticipants.vendorId],
    references: [users.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  order: one(orders, {
    fields: [reviews.orderId],
    references: [orders.id],
  }),
  vendor: one(users, {
    fields: [reviews.vendorId],
    references: [users.id],
    relationName: "vendorReviews",
  }),
  supplier: one(users, {
    fields: [reviews.supplierId],
    references: [users.id],
    relationName: "supplierReviews",
  }),
}));

export const priceAlertsRelations = relations(priceAlerts, ({ one }) => ({
  vendor: one(users, {
    fields: [priceAlerts.vendorId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [priceAlerts.productId],
    references: [products.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroupOrderSchema = createInsertSchema(groupOrders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGroupOrderParticipantSchema = createInsertSchema(groupOrderParticipants).omit({
  id: true,
  joinedAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
});

export const insertPriceAlertSchema = createInsertSchema(priceAlerts).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type GroupOrder = typeof groupOrders.$inferSelect;
export type InsertGroupOrder = z.infer<typeof insertGroupOrderSchema>;
export type GroupOrderParticipant = typeof groupOrderParticipants.$inferSelect;
export type InsertGroupOrderParticipant = z.infer<typeof insertGroupOrderParticipantSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = z.infer<typeof insertPriceAlertSchema>;
