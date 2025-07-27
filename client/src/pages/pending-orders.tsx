import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, X, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function PendingOrders() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/orders/supplier"],
    enabled: isAuthenticated,
  });

  const pendingOrders = (orders as any[]).filter((order: any) => order.status === 'pending');

  const handleAcceptOrder = (orderId: string) => {
    toast({
      title: "Order Accepted",
      description: `Order ${orderId} has been accepted and is now being processed`,
    });
  };

  const handleDeclineOrder = (orderId: string) => {
    toast({
      title: "Order Declined",
      description: `Order ${orderId} has been declined`,
      variant: "destructive",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex">
        <Sidebar userRole="supplier" />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pending Orders</h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
                    Review and manage incoming orders from vendors
                  </p>
                </div>
                <Badge variant="outline" className="px-3 py-1">
                  {pendingOrders.length} Pending
                </Badge>
              </div>
            </div>

            <div className="space-y-6">
              {isLoading ? (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-8 text-center">
                    <div className="text-slate-500 dark:text-gray-400">Loading orders...</div>
                  </CardContent>
                </Card>
              ) : pendingOrders.length === 0 ? (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-8 text-center">
                    <Clock className="h-16 w-16 mx-auto text-slate-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      No Pending Orders
                    </h3>
                    <p className="text-slate-600 dark:text-gray-300">
                      All caught up! New orders will appear here when they arrive.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingOrders.map((order: any) => (
                  <Card key={order.id} className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                Order #{order.id?.slice(-6).toUpperCase()}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-gray-300">
                                Received on {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-3 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide">Product</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {order.productName || "Product"}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide">Quantity</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {order.quantity} units
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide">Total Amount</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                ₹{parseFloat(String(order.totalAmount || "0")).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="dark:border-gray-500 dark:text-gray-300">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending Review
                            </Badge>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => handleAcceptOrder(order.id)}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Accept
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeclineOrder(order.id)}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Decline
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}