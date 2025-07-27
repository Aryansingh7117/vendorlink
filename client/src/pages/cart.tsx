import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, Package, Truck } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const [cartItems, setCartItems] = useState<CartItem[]>([
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
    },
    {
      id: "3",
      name: "Fresh Red Onions",
      supplier: "Veggie World",
      price: 35,
      unit: "kg",
      quantity: 50,
      minOrder: 25,
      available: 1000
    }
  ]);

  const updateQuantity = (id: string, newQuantity: number) => {
    setCartItems(items => 
      items.map(item => {
        if (item.id === id) {
          const quantity = Math.max(item.minOrder, Math.min(newQuantity, item.available));
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    const item = cartItems.find(item => item.id === id);
    setCartItems(items => items.filter(item => item.id !== id));
    toast({
      title: "Item Removed",
      description: `${item?.name} removed from cart`,
    });
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 2000 ? 0 : 150;
  const total = subtotal + deliveryFee;

  const handleCheckout = () => {
    toast({
      title: "Order Placed Successfully!",
      description: `Your order for ₹${total.toFixed(2)} has been confirmed. You'll receive updates via email.`,
    });
    
    // Clear cart after successful order
    setTimeout(() => {
      setCartItems([]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                <ShoppingBag className="h-6 w-6 mr-2" />
                Shopping Cart
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Review your items and place your order
              </p>
            </div>

            {cartItems.length === 0 ? (
              <Card>
                <CardContent className="text-center py-16">
                  <ShoppingBag className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                  <h3 className="text-lg font-medium text-slate-900 mb-2">Your cart is empty</h3>
                  <p className="text-slate-600 mb-6">Add some products to get started</p>
                  <Button onClick={() => window.location.href = "/marketplace"}>
                    Browse Products
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Items in Cart ({cartItems.length})</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Package className="h-8 w-8 text-slate-400" />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900">{item.name}</h4>
                            <p className="text-sm text-slate-600">by {item.supplier}</p>
                            <p className="text-sm text-slate-500">₹{item.price}/{item.unit}</p>
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
                            <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-800"
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
                  <Card>
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery Fee</span>
                        <span>{deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}</span>
                      </div>
                      {deliveryFee === 0 && (
                        <p className="text-xs text-green-600">Free delivery on orders above ₹2000</p>
                      )}
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
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
                  <Card className="mt-6">
                    <CardHeader>
                      <CardTitle className="text-base">Delivery Information</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-slate-600 space-y-2">
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