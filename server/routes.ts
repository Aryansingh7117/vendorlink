import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
// Authentication removed for deployment simplicity
import { insertProductSchema, insertOrderSchema, insertGroupOrderSchema, insertGroupOrderParticipantSchema, insertReviewSchema, insertPriceAlertSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Mock user data for demo purposes without authentication
  const mockUser = {
    id: "demo-user",
    email: "demo@vendorlink.com", 
    name: "Demo User",
    role: "both",
    credits: 2500
  };

  // Ensure demo user exists in database for foreign key constraints
  try {
    const existingUser = await storage.getUser("demo-user");
    if (!existingUser) {
      await storage.upsertUser({
        id: "demo-user",
        email: "demo@vendorlink.com",
        firstName: "Demo",
        lastName: "User",
        role: "both"
      });
    }
  } catch (error) {
    console.log("Demo user setup:", error);
  }

  // Mock auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    res.json(mockUser);
  });

  // User role update
  app.patch('/api/user/role', async (req: any, res) => {
    try {
      const { role } = req.body;
      
      if (!['vendor', 'supplier', 'both'].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      const updatedUser = { ...mockUser, role };
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });

  // Categories
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Products
  app.get('/api/products', async (req, res) => {
    try {
      const { categoryId, supplierId, searchTerm, minPrice, maxPrice } = req.query;
      
      const filters: any = {};
      if (categoryId) filters.categoryId = categoryId as string;
      if (supplierId) filters.supplierId = supplierId as string;
      if (searchTerm) filters.searchTerm = searchTerm as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post('/api/products', async (req: any, res) => {
    try {
      const userId = "demo-user"; // Use demo user for non-auth version

      const productData = insertProductSchema.parse({
        ...req.body,
        supplierId: userId,
      });

      const product = await storage.createProduct(productData);
      res.json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.patch('/api/products/:id/stock', async (req: any, res) => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;

      const updatedProduct = await storage.updateProductStock(id, quantity);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating stock:", error);
      res.status(500).json({ message: "Failed to update stock" });
    }
  });

  // Orders
  app.get('/api/orders', async (req: any, res) => {
    try {
      const userId = "demo-user"; // Use demo user for non-auth version
      const { type } = req.query; // 'vendor' or 'supplier'

      const filters: any = {};
      if (type === 'vendor') {
        filters.vendorId = userId;
      } else if (type === 'supplier') {
        filters.supplierId = userId;
      } else {
        // Get both vendor and supplier orders
        const vendorOrders = await storage.getOrders({ vendorId: userId });
        const supplierOrders = await storage.getOrders({ supplierId: userId });
        return res.json([...vendorOrders, ...supplierOrders]);
      }

      const orders = await storage.getOrders(filters);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post('/api/orders', async (req: any, res) => {
    try {
      const userId = "demo-user"; // Use demo user for non-auth version
      const { items, totalAmount, status = "pending" } = req.body;

      // Handle cart with multiple items - create separate orders for each item
      if (items && Array.isArray(items)) {
        const createdOrders = [];
        
        for (const item of items) {
          const orderData = {
            vendorId: userId,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            pricePerUnit: item.price.toString(),
            totalAmount: (item.price * item.quantity).toString(),
            supplierId: userId, // Use current user as supplier for now
            supplierName: item.supplierName || "Default Supplier",
            status: status,
            orderDate: new Date().toISOString()
          };

          const order = await storage.createOrder(orderData);
          createdOrders.push(order);
        }
        
        res.json({ message: `${createdOrders.length} orders created successfully`, orders: createdOrders });
      } else {
        // Handle single product order (existing functionality)
        const orderData = insertOrderSchema.parse({
          ...req.body,
          vendorId: userId,
        });

        const product = await storage.getProduct(orderData.productId);
        if (!product) {
          return res.status(404).json({ message: "Product not found" });
        }

        orderData.pricePerUnit = product.pricePerUnit;
        orderData.totalAmount = (parseFloat(product.pricePerUnit) * orderData.quantity).toFixed(2);

        const order = await storage.createOrder(orderData);
        res.json(order);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.patch('/api/orders/:id/status', async (req: any, res) => {
    try {
      const userId = "demo-user";
      const { id } = req.params;
      const { status } = req.body;

      const order = await storage.getOrder(id);
      if (!order || order.supplierId !== userId) {
        return res.status(404).json({ message: "Order not found" });
      }

      const updatedOrder = await storage.updateOrderStatus(id, status);
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Group Orders
  app.get('/api/group-orders', async (req, res) => {
    try {
      const groupOrders = await storage.getActiveGroupOrders();
      res.json(groupOrders);
    } catch (error) {
      console.error("Error fetching group orders:", error);
      res.status(500).json({ message: "Failed to fetch group orders" });
    }
  });

  app.post('/api/group-orders', async (req: any, res) => {
    try {
      const userId = "demo-user";
      const groupOrderData = insertGroupOrderSchema.parse({
        ...req.body,
        organizerId: userId,
      });

      const groupOrder = await storage.createGroupOrder(groupOrderData);
      res.json(groupOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid group order data", errors: error.errors });
      }
      console.error("Error creating group order:", error);
      res.status(500).json({ message: "Failed to create group order" });
    }
  });

  app.post('/api/group-orders/:id/join', async (req: any, res) => {
    try {
      const userId = "demo-user";
      const { id } = req.params;
      const { quantity } = req.body;

      const participationData = insertGroupOrderParticipantSchema.parse({
        groupOrderId: id,
        vendorId: userId,
        quantity,
      });

      const participation = await storage.joinGroupOrder(participationData);
      res.json(participation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid participation data", errors: error.errors });
      }
      console.error("Error joining group order:", error);
      res.status(500).json({ message: "Failed to join group order" });
    }
  });

  // Reviews
  app.post('/api/reviews', async (req: any, res) => {
    try {
      const userId = "demo-user";
      const reviewData = insertReviewSchema.parse({
        ...req.body,
        vendorId: userId,
      });

      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid review data", errors: error.errors });
      }
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Price Alerts
  app.get('/api/price-alerts', async (req: any, res) => {
    try {
      const userId = "demo-user";
      const priceAlerts = await storage.getPriceAlerts(userId);
      res.json(priceAlerts);
    } catch (error) {
      console.error("Error fetching price alerts:", error);
      res.status(500).json({ message: "Failed to fetch price alerts" });
    }
  });

  app.post('/api/price-alerts', async (req: any, res) => {
    try {
      const userId = "demo-user";
      const alertData = insertPriceAlertSchema.parse({
        ...req.body,
        vendorId: userId,
      });

      const priceAlert = await storage.createPriceAlert(alertData);
      res.json(priceAlert);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid price alert data", errors: error.errors });
      }
      console.error("Error creating price alert:", error);
      res.status(500).json({ message: "Failed to create price alert" });
    }
  });

  // Analytics
  app.get('/api/stats/vendor', async (req: any, res) => {
    try {
      const userId = "demo-user";
      const stats = await storage.getVendorStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching vendor stats:", error);
      res.status(500).json({ message: "Failed to fetch vendor stats" });
    }
  });

  app.get('/api/stats/supplier', async (req: any, res) => {
    try {
      const userId = "demo-user";
      const stats = await storage.getSupplierStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching supplier stats:", error);
      res.status(500).json({ message: "Failed to fetch supplier stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
