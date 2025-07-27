import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Search, Eye, RefreshCw, Star, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

export default function Orders() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, label: "Pending" },
      confirmed: { variant: "default" as const, label: "Confirmed" },
      shipped: { variant: "secondary" as const, label: "Shipped" },
      delivered: { variant: "default" as const, label: "Delivered" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = !searchTerm || 
      order.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplierName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id?.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const handleTrackOrder = (orderId: string) => {
    toast({
      title: "Order Tracking",
      description: `Tracking order ${orderId} - Status updates will be shown here`,
    });
  };

  const handleReorder = (orderId: string) => {
    toast({
      title: "Reordering",
      description: `Items from order ${orderId} have been added to your cart`,
    });
  };

  const handleCancelOrder = (orderId: string) => {
    toast({
      title: "Order Cancelled",
      description: `Order ${orderId} has been cancelled successfully`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Order Management</h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
                    Track and manage all your purchase orders
                  </p>
                </div>
                <div className="mt-4 lg:mt-0">
                  <Button onClick={() => refetch()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Refresh Orders
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search orders by product, supplier, or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Search className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div className="w-48">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
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
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-slate-500 dark:text-gray-400">Loading orders...</div>
                  </CardContent>
                </Card>
              ) : filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-16 w-16 mx-auto text-slate-300 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                      {searchTerm || statusFilter !== "all" ? "No matching orders" : "No orders yet"}
                    </h3>
                    <p className="text-slate-600 dark:text-gray-300 mb-6">
                      {searchTerm || statusFilter !== "all" 
                        ? "Try adjusting your search or filter criteria" 
                        : "Start shopping to see your orders here"
                      }
                    </p>
                    {!searchTerm && statusFilter === "all" && (
                      <Button onClick={() => window.location.href = "/marketplace"}>
                        Browse Products
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-4">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                              <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {order.productName || `Order #${order.id}`}
                              </h3>
                              <p className="text-sm text-slate-600 dark:text-gray-300">
                                Order ID: {order.id} • Placed on {new Date(order.orderDate || Date.now()).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div>
                              <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide">Supplier</p>
                              <p className="text-sm font-medium text-slate-900 dark:text-white">
                                {order.supplierName || "Default Supplier"}
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
                                ₹{parseFloat(order.totalAmount || "0").toLocaleString()}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wide">Status</p>
                              {getStatusBadge(order.status)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleTrackOrder(order.id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Track
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReorder(order.id)}
                          >
                            <RefreshCw className="h-4 w-4 mr-1" />
                            Reorder
                          </Button>
                          {order.status === 'pending' && (
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleCancelOrder(order.id)}
                            >
                              Cancel
                            </Button>
                          )}
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