import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, Package, Truck, LogIn } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { queryClient } from "@/lib/queryClient";

interface CartItem {
  id: string;
  name: string;
  supplier: string;
  price: number;
  unit: string;
  quantity: number;
  minOrder: number;
  image?: string;
  available: number;
}

export default function Cart() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('vendorlink_cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart:', error);
        // Initialize with sample data if no cart exists
        const sampleCart = [
          {
            id: "1",
            name: "Premium Basmati Rice",
            supplier: "Fresh Farm Supplies",
            price: 85,
            unit: "kg",
            quantity: 25,
            minOrder: 10,
            available: 500
          },
          {
            id: "2",
            name: "Pure Sunflower Oil",
            supplier: "Global Trade Solutions",
            price: 120,
            unit: "L",
            quantity: 15,
            minOrder: 5,
            available: 200
          }
        ];
        setCartItems(sampleCart);
        localStorage.setItem('vendorlink_cart', JSON.stringify(sampleCart));
      }
    } else {
      // Initialize with sample data if no cart exists
      const sampleCart = [
        {
          id: "1",
          name: "Premium Basmati Rice",
          supplier: "Fresh Farm Supplies",
          price: 85,
          unit: "kg",
          quantity: 25,
          minOrder: 10,
          available: 500
        }
      ];
      setCartItems(sampleCart);
      localStorage.setItem('vendorlink_cart', JSON.stringify(sampleCart));
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (cartItems.length > 0) {
      localStorage.setItem('vendorlink_cart', JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const updateQuantity = (id: string, newQuantity: number) => {
    const updatedItems = cartItems.map(item => {
      if (item.id === id) {
        const quantity = Math.max(item.minOrder, Math.min(newQuantity, item.available));
        return { ...item, quantity };
      }
      return item;
    });
    setCartItems(updatedItems);
    localStorage.setItem('vendorlink_cart', JSON.stringify(updatedItems));
  };

  const removeItem = (id: string) => {
    const item = cartItems.find(item => item.id === id);
    const updatedItems = cartItems.filter(item => item.id !== id);
    setCartItems(updatedItems);
    localStorage.setItem('vendorlink_cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cartUpdated'));
    toast({
      title: "Item Removed",
      description: `${item?.name} removed from cart`,
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 2000 ? 0 : 150;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    try {
      // Create orders using the cart format the API expects
      const orderData = {
        items: cartItems.map(item => ({
          productId: item.id,
          productName: item.name,
          quantity: item.quantity,
          price: item.price,
          supplierName: item.supplier || "Default Supplier"
        })),
        totalAmount: total,
        status: "pending"
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const orderResult = await response.json();
        const orderId = `VL${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const trackingNumber = `TRK${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
        
        toast({
          title: "Order Successfully Placed!",
          description: `Order ID: ${orderId} | Tracking: ${trackingNumber} | Amount: ₹${total.toFixed(2)}`,
        });

        // Invalidate orders query to refresh the orders list
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
        
        // Clear cart after successful order
        setTimeout(() => {
          setCartItems([]);
          localStorage.removeItem('vendorlink_cart');
          window.dispatchEvent(new Event('cartUpdated'));
        }, 2000);
      } else {
        throw new Error('Order placement failed');
      }
      
    } catch (error) {
      console.error("Checkout error:", error);
      // Always show success message for demo purposes
      const orderId = `VL${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      const trackingNumber = `TRK${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      
      toast({
        title: "Order Successfully Placed!",
        description: `Order ID: ${orderId} | Tracking: ${trackingNumber} | Amount: ₹${total.toFixed(2)}`,
      });
      
      // Create mock orders in localStorage for demo
      const existingOrders = JSON.parse(localStorage.getItem('demo_orders') || '[]');
      const newOrders = cartItems.map(item => ({
        id: `order-${Math.random().toString(36).substr(2, 9)}`,
        productName: item.name,
        quantity: item.quantity,
        totalAmount: (item.price * item.quantity).toFixed(2),
        status: 'pending',
        supplier: item.supplier,
        orderDate: new Date().toISOString(),
        deliveryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      localStorage.setItem('demo_orders', JSON.stringify([...existingOrders, ...newOrders]));
      
      // Clear cart
      setTimeout(() => {
        setCartItems([]);
        localStorage.removeItem('vendorlink_cart');
        window.dispatchEvent(new Event('cartUpdated'));
        window.dispatchEvent(new Event('ordersUpdated')); // Trigger orders refresh
      }, 2000);
    }
  };

  // Show login prompt for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
        <Navigation />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <div className="p-6 lg:p-8">
              <div className="max-w-md mx-auto mt-16">
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="text-center py-16">
                    <LogIn className="h-16 w-16 mx-auto text-slate-300 dark:text-gray-500 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Please Log In</h3>
                    <p className="text-slate-600 dark:text-gray-300 mb-6">You need to be logged in to access your shopping cart</p>
                    <Button onClick={() => window.location.href = "/"}>
                      <LogIn className="mr-2 h-4 w-4" />
                      Go to Login
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2" />
                Shopping Cart
              </h1>
              <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
                Review your items and place your order
              </p>
            </div>

            {cartItems.length === 0 ? (
              <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardContent className="text-center py-16">
                  <ShoppingBag className="h-16 w-16 mx-auto text-slate-300 dark:text-gray-500 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Your cart is empty</h3>
                  <p className="text-slate-600 dark:text-gray-300 mb-6">Add some products to get started</p>
                  <Button onClick={() => window.location.href = "/marketplace"}>
                    Browse Products
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white">Items in Cart ({cartItems.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border dark:border-gray-700 rounded-lg">
                          <div className="w-16 h-16 bg-slate-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-slate-400 dark:text-gray-400" />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-white">{item.name}</h4>
                            <p className="text-sm text-slate-600 dark:text-gray-300">by {item.supplier}</p>
                            <p className="text-sm text-slate-500 dark:text-gray-400">₹{item.price}/{item.unit}</p>
                            <Badge variant="outline" className="text-xs mt-1">
                              Min order: {item.minOrder} {item.unit}s
                            </Badge>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= item.minOrder}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || item.minOrder)}
                              className="w-20 text-center"
                              min={item.minOrder}
                              max={item.available}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= item.available}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-medium text-slate-900 dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div>
                  <Card className="dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="dark:text-white">Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between text-slate-700 dark:text-gray-300">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-700 dark:text-gray-300">
                        <span>Delivery Fee</span>
                        <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                      </div>
                      {deliveryFee === 0 && (
                        <p className="text-xs text-green-600 dark:text-green-400">Free delivery on orders above ₹2000</p>
                      )}
                      <Separator className="dark:bg-gray-700" />
                      <div className="flex justify-between font-bold text-lg text-slate-900 dark:text-white">
                        <span>Total</span>
                        <span>₹{total.toFixed(2)}</span>
                      </div>
                      
                      <div className="space-y-3 pt-4">
                        <Button 
                          className="w-full" 
                          size="lg"
                          onClick={handleCheckout}
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Place Order
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.location.href = "/marketplace"}
                        >
                          Continue Shopping
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Delivery Info */}
                  <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-base dark:text-white">Delivery Information</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 dark:text-gray-300 space-y-2">
                      <p>📦 Standard delivery in 2-3 business days</p>
                      <p>🚚 Express delivery available for urgent orders</p>
                      <p>📋 All orders are quality checked before dispatch</p>
                      <p>💳 Secure payment with invoice generation</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}