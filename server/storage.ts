import {
  users,
  products,
  categories,
  orders,
  groupOrders,
  groupOrderParticipants,
  reviews,
  priceAlerts,
  productReviews,
  supportTickets,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Category,
  type InsertCategory,
  type Order,
  type InsertOrder,
  type GroupOrder,
  type InsertGroupOrder,
  type GroupOrderParticipant,
  type InsertGroupOrderParticipant,
  type Review,
  type InsertReview,
  type PriceAlert,
  type InsertPriceAlert,
  type ProductReview,
  type InsertProductReview,
  type SupportTicket,
  type InsertSupportTicket,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, like, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: 'vendor' | 'supplier' | 'both'): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(filters?: {
    categoryId?: string;
    supplierId?: string;
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product>;
  updateProductStock(id: string, quantity: number): Promise<Product>;
  
  // Order operations
  getOrders(filters?: {
    vendorId?: string;
    supplierId?: string;
    status?: string;
  }): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order>;
  
  // Group order operations
  getActiveGroupOrders(): Promise<GroupOrder[]>;
  getGroupOrder(id: string): Promise<GroupOrder | undefined>;
  createGroupOrder(groupOrder: InsertGroupOrder): Promise<GroupOrder>;
  joinGroupOrder(participation: InsertGroupOrderParticipant): Promise<GroupOrderParticipant>;
  getGroupOrderParticipants(groupOrderId: string): Promise<GroupOrderParticipant[]>;
  
  // Review operations
  getReviews(supplierId: string): Promise<Review[]>;
  createReview(review: InsertReview): Promise<Review>;
  
  // Price alert operations
  getPriceAlerts(vendorId: string): Promise<PriceAlert[]>;
  createPriceAlert(priceAlert: InsertPriceAlert): Promise<PriceAlert>;
  
  // Product review operations
  getProductReviews(productId: string): Promise<ProductReview[]>;
  createProductReview(review: InsertProductReview): Promise<ProductReview>;
  
  // Support ticket operations
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  getUserSupportTickets(userId: string): Promise<SupportTicket[]>;
  updateSupportTicketStatus(id: string, status: string): Promise<SupportTicket>;
  
  // Analytics
  getVendorStats(vendorId: string): Promise<{
    activeOrders: number;
    monthlySavings: number;
    creditScore: number;
    groupOrders: number;
  }>;
  getSupplierStats(supplierId: string): Promise<{
    pendingOrders: number;
    monthlyRevenue: number;
    rating: number;
    productsListed: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserRole(id: string, role: 'vendor' | 'supplier' | 'both'): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(asc(categories.name));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Product operations
  async getProducts(filters?: {
    categoryId?: string;
    supplierId?: string;
    searchTerm?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<Product[]> {
    let query = db.select().from(products).where(eq(products.isActive, true));

    if (filters?.categoryId) {
      query = query.where(eq(products.categoryId, filters.categoryId));
    }
    if (filters?.supplierId) {
      query = query.where(eq(products.supplierId, filters.supplierId));
    }
    if (filters?.searchTerm) {
      query = query.where(like(products.name, `%${filters.searchTerm}%`));
    }
    if (filters?.minPrice) {
      query = query.where(gte(products.pricePerUnit, filters.minPrice.toString()));
    }
    if (filters?.maxPrice) {
      query = query.where(lte(products.pricePerUnit, filters.maxPrice.toString()));
    }

    return await query.orderBy(asc(products.name));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async updateProductStock(id: string, quantity: number): Promise<Product> {
    const [product] = await db
      .update(products)
      .set({ availableQuantity: quantity, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  // Order operations
  async getOrders(filters?: {
    vendorId?: string;
    supplierId?: string;
    status?: string;
  }): Promise<Order[]> {
    let query = db.select().from(orders);

    if (filters?.vendorId) {
      query = query.where(eq(orders.vendorId, filters.vendorId));
    }
    if (filters?.supplierId) {
      query = query.where(eq(orders.supplierId, filters.supplierId));
    }
    if (filters?.status) {
      query = query.where(eq(orders.status, filters.status as any));
    }

    return await query.orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ status: status as any, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Group order operations
  async getActiveGroupOrders(): Promise<GroupOrder[]> {
    return await db
      .select()
      .from(groupOrders)
      .where(eq(groupOrders.status, 'active'))
      .orderBy(asc(groupOrders.deadline));
  }

  async getGroupOrder(id: string): Promise<GroupOrder | undefined> {
    const [groupOrder] = await db.select().from(groupOrders).where(eq(groupOrders.id, id));
    return groupOrder;
  }

  async createGroupOrder(groupOrder: InsertGroupOrder): Promise<GroupOrder> {
    const [newGroupOrder] = await db.insert(groupOrders).values(groupOrder).returning();
    return newGroupOrder;
  }

  async joinGroupOrder(participation: InsertGroupOrderParticipant): Promise<GroupOrderParticipant> {
    const [participant] = await db.insert(groupOrderParticipants).values(participation).returning();
    
    // Update group order participant count and quantity
    await db
      .update(groupOrders)
      .set({
        currentParticipants: sql`${groupOrders.currentParticipants} + 1`,
        currentQuantity: sql`${groupOrders.currentQuantity} + ${participation.quantity}`,
        updatedAt: new Date(),
      })
      .where(eq(groupOrders.id, participation.groupOrderId));

    return participant;
  }

  async getGroupOrderParticipants(groupOrderId: string): Promise<GroupOrderParticipant[]> {
    return await db
      .select()
      .from(groupOrderParticipants)
      .where(eq(groupOrderParticipants.groupOrderId, groupOrderId));
  }

  // Review operations
  async getReviews(supplierId: string): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.supplierId, supplierId))
      .orderBy(desc(reviews.createdAt));
  }

  async createReview(review: InsertReview): Promise<Review> {
    const [newReview] = await db.insert(reviews).values(review).returning();
    return newReview;
  }

  // Price alert operations
  async getPriceAlerts(vendorId: string): Promise<PriceAlert[]> {
    return await db
      .select()
      .from(priceAlerts)
      .where(and(eq(priceAlerts.vendorId, vendorId), eq(priceAlerts.isActive, true)));
  }

  async createPriceAlert(priceAlert: InsertPriceAlert): Promise<PriceAlert> {
    const [newPriceAlert] = await db.insert(priceAlerts).values(priceAlert).returning();
    return newPriceAlert;
  }

  // Analytics
  async getVendorStats(vendorId: string): Promise<{
    activeOrders: number;
    monthlySavings: number;
    creditScore: number;
    groupOrders: number;
  }> {
    const activeOrdersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(
        eq(orders.vendorId, vendorId),
        sql`${orders.status} IN ('pending', 'processing', 'in_transit')`
      ));

    const groupOrdersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(groupOrderParticipants)
      .where(eq(groupOrderParticipants.vendorId, vendorId));

    const user = await this.getUser(vendorId);

    return {
      activeOrders: activeOrdersResult[0]?.count || 0,
      monthlySavings: 24500, // Placeholder - would calculate from order history
      creditScore: user?.creditScore || 600,
      groupOrders: groupOrdersResult[0]?.count || 0,
    };
  }

  async getSupplierStats(supplierId: string): Promise<{
    pendingOrders: number;
    monthlyRevenue: number;
    rating: number;
    productsListed: number;
  }> {
    const pendingOrdersResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(orders)
      .where(and(
        eq(orders.supplierId, supplierId),
        eq(orders.status, 'pending')
      ));

    const productsResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(and(
        eq(products.supplierId, supplierId),
        eq(products.isActive, true)
      ));

    const reviewsResult = await db
      .select({ avg: sql<number>`avg(${reviews.rating})` })
      .from(reviews)
      .where(eq(reviews.supplierId, supplierId));

    return {
      pendingOrders: pendingOrdersResult[0]?.count || 0,
      monthlyRevenue: 120000, // Placeholder - would calculate from delivered orders
      rating: reviewsResult[0]?.avg || 0,
      productsListed: productsResult[0]?.count || 0,
    };
  }
}

export const storage = new DatabaseStorage();
