import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Sidebar from "@/components/sidebar";
import Navigation from "@/components/navigation";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { 
  Clock, 
  IndianRupee, 
  Star, 
  Package, 
  Plus,
  AlertCircle,
  CheckCircle,
  X
} from "lucide-react";

export default function SupplierDashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showAddProduct, setShowAddProduct] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check if user is supplier
  useEffect(() => {
    if (user && user.role !== 'supplier' && user.role !== 'both') {
      toast({
        title: "Access Denied",
        description: "Only suppliers can access this dashboard",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/supplier"],
    enabled: isAuthenticated && (user?.role === 'supplier' || user?.role === 'both'),
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
    enabled: isAuthenticated && (user?.role === 'supplier' || user?.role === 'both'),
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders", "supplier"],
    enabled: isAuthenticated && (user?.role === 'supplier' || user?.role === 'both'),
  });

  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      await apiRequest("PATCH", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order status updated successfully" });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  if (user?.role !== 'supplier' && user?.role !== 'both') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-error-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-slate-600 mb-4">
              Only suppliers can access this dashboard
            </p>
            <Button onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingOrders = orders.filter(order => order.status === 'pending');
  const myProducts = products.filter(product => product.supplierId === user?.id);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="flex">
        <Sidebar userRole="supplier" />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            {/* Dashboard Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900" data-testid="text-supplier-dashboard-title">
                    Supplier Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Manage your products and fulfill orders
                  </p>
                </div>
                <div className="mt-4 lg:mt-0">
                  <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-add-product">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Product
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Product</DialogTitle>
                      </DialogHeader>
                      <div className="text-center py-8 text-slate-500">
                        Product creation form would go here
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-warning-500/10 rounded-md flex items-center justify-center">
                        <Clock className="h-5 w-5 text-warning-600" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 truncate">Pending Orders</dt>
                        <dd className="text-lg font-medium text-slate-900" data-testid="text-pending-orders">
                          {statsLoading ? "..." : stats?.pendingOrders || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-success-500/10 rounded-md flex items-center justify-center">
                        <IndianRupee className="h-5 w-5 text-success-600" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 truncate">Monthly Revenue</dt>
                        <dd className="text-lg font-medium text-slate-900" data-testid="text-monthly-revenue">
                          {statsLoading ? "..." : `₹${stats?.monthlyRevenue?.toLocaleString() || 0}`}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-warning-500/10 rounded-md flex items-center justify-center">
                        <Star className="h-5 w-5 text-warning-600" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 truncate">Rating</dt>
                        <dd className="text-lg font-medium text-slate-900" data-testid="text-rating">
                          {statsLoading ? "..." : stats?.rating?.toFixed(1) || "0.0"}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 truncate">Products Listed</dt>
                        <dd className="text-lg font-medium text-slate-900" data-testid="text-products-listed">
                          {statsLoading ? "..." : stats?.productsListed || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Inventory */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  {productsLoading ? (
                    <div className="text-center py-4 text-slate-500">Loading...</div>
                  ) : myProducts.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Package className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p>No products listed yet</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setShowAddProduct(true)}
                        data-testid="button-add-first-product"
                      >
                        Add Your First Product
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {myProducts.slice(0, 5).map((product) => (
                        <div 
                          key={product.id} 
                          className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                          data-testid={`card-inventory-product-${product.id}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-slate-900" data-testid={`text-inventory-product-name-${product.id}`}>
                                {product.name}
                              </h4>
                              <p className="text-sm text-slate-600" data-testid={`text-inventory-product-price-${product.id}`}>
                                ₹{product.pricePerUnit}/{product.unit}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${
                              product.availableQuantity > 50 
                                ? 'text-success-600' 
                                : product.availableQuantity > 10 
                                ? 'text-warning-600' 
                                : 'text-error-600'
                            }`} data-testid={`text-inventory-product-stock-${product.id}`}>
                              {product.availableQuantity} {product.unit}
                            </p>
                            <Button variant="ghost" size="sm" data-testid={`button-update-stock-${product.id}`}>
                              Update Stock
                            </Button>
                          </div>
                        </div>
                      ))}
                      {myProducts.length > 5 && (
                        <Button variant="outline" className="w-full" data-testid="button-view-all-products">
                          View All Products ({myProducts.length})
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Incoming Orders */}
              <Card>
                <CardHeader>
                  <CardTitle>Incoming Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="text-center py-4 text-slate-500">Loading...</div>
                  ) : pendingOrders.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                      <p>No pending orders</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingOrders.slice(0, 5).map((order) => (
                        <div 
                          key={order.id} 
                          className="border border-slate-200 rounded-lg p-4"
                          data-testid={`card-pending-order-${order.id}`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-900" data-testid={`text-pending-order-id-${order.id}`}>
                              Order #{order.id.slice(-6).toUpperCase()}
                            </h4>
                            <Badge variant="outline">Pending</Badge>
                          </div>
                          <p className="text-sm text-slate-600" data-testid={`text-pending-order-details-${order.id}`}>
                            {order.quantity} units
                          </p>
                          <p className="text-sm font-medium text-slate-900 mt-1" data-testid={`text-pending-order-total-${order.id}`}>
                            ₹{order.totalAmount}
                          </p>
                          <div className="flex gap-2 mt-3">
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, status: 'processing' })}
                              disabled={updateOrderStatusMutation.isPending}
                              data-testid={`button-accept-order-${order.id}`}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive"
                              onClick={() => updateOrderStatusMutation.mutate({ orderId: order.id, status: 'cancelled' })}
                              disabled={updateOrderStatusMutation.isPending}
                              data-testid={`button-decline-order-${order.id}`}
                            >
                              <X className="w-3 h-3 mr-1" />
                              Decline
                            </Button>
                          </div>
                        </div>
                      ))}
                      {pendingOrders.length > 5 && (
                        <Button variant="outline" className="w-full" data-testid="button-view-all-orders">
                          View All Orders ({pendingOrders.length})
                        </Button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
