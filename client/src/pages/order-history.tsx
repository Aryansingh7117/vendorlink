import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, CheckCircle, Truck, Clock, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function OrderHistory() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: orders = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/orders/supplier"],
    enabled: isAuthenticated,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, label: "Pending", icon: Clock },
      processing: { variant: "default" as const, label: "Processing", icon: Package },
      shipped: { variant: "secondary" as const, label: "Shipped", icon: Truck },
      delivered: { variant: "default" as const, label: "Delivered", icon: CheckCircle },
      cancelled: { variant: "destructive" as const, label: "Cancelled", icon: X }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const IconComponent = config.icon;
    
    return (
      <Badge variant={config.variant}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const filteredOrders = (orders as any[]).filter((order: any) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = !searchTerm || 
      order.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const completedOrders = (orders as any[]).filter((order: any) => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex">
        <Sidebar userRole="supplier" />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order History</h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
                    View and manage all completed orders
                  </p>
                </div>
                <div className="mt-4 lg:mt-0">
                  <Badge variant="outline" className="px-3 py-1">
                    {completedOrders.length} Completed Orders
                  </Badge>
                </div>
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-6 dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search orders by product or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Search className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div className="w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Orders List */}
            <div className="space-y-4">
              {isLoading ? (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-8 text-center">
                    <div className="text-slate-500 dark:text-gray-400">Loading order history...</div>
                  </CardContent>
                </Card>
              ) : filteredOrders.length === 0 ? (
                <Card className="dark:bg-gray-800 dark:border-gray-700">
                  <CardContent className="p-8 text-center">
                    <Package className="h-16 w-16 mx-auto text-slate-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      {searchTerm || statusFilter !== "all" ? "No matching orders" : "No order history"}
                    </h3>
                    <p className="text-slate-600 dark:text-gray-300 mb-6">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your search or filter criteria" 
                        : "Completed orders will appear here"
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order: any) => (
                  <Card key={order.id} className="dark:bg-gray-800 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {order.productName || `Order #${order.id?.slice(-6).toUpperCase()}`}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-gray-300">
                                Order ID: {order.id} • Placed on {new Date(order.createdAt || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-4 gap-4 mb-4">
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
                            <div>
                              <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
                              <div className="mt-1">
                                {getStatusBadge(order.status)}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide">Completed</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {order.status === 'delivered' ? 'Yes' : order.status === 'cancelled' ? 'Cancelled' : 'In Progress'}
                              </p>
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