import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Sidebar from "@/components/sidebar";
import Navigation from "@/components/navigation";
import GroupOrderCard from "@/components/group-order-card";
import OrderTable from "@/components/order-table";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ShoppingCart, 
  IndianRupee, 
  Star, 
  Users, 
  Plus, 
  Search,
  TrendingUp,
  TrendingDown
} from "lucide-react";

export default function VendorDashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/stats/vendor"],
    enabled: isAuthenticated,
  });

  const { data: groupOrders = [], isLoading: groupOrdersLoading } = useQuery({
    queryKey: ["/api/group-orders"],
    enabled: isAuthenticated,
  });

  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const recentOrders = orders.slice(0, 5);
  const activeGroupOrders = groupOrders.slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="flex">
        <Sidebar userRole="vendor" />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            {/* Dashboard Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900" data-testid="text-dashboard-title">
                    Vendor Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Manage your procurement and supplier relationships
                  </p>
                </div>
                <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
                  <Button variant="outline" data-testid="button-join-group-order">
                    <Plus className="mr-2 h-4 w-4" />
                    Join Group Order
                  </Button>
                  <Button data-testid="button-find-suppliers">
                    <Search className="mr-2 h-4 w-4" />
                    Find Suppliers
                  </Button>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                        <ShoppingCart className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 truncate">Active Orders</dt>
                        <dd className="text-lg font-medium text-slate-900" data-testid="text-active-orders">
                          {statsLoading ? "..." : stats?.activeOrders || 0}
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
                        <dt className="text-sm font-medium text-slate-500 truncate">Monthly Savings</dt>
                        <dd className="text-lg font-medium text-slate-900" data-testid="text-monthly-savings">
                          {statsLoading ? "..." : `₹${stats?.monthlySavings?.toLocaleString() || 0}`}
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
                        <dt className="text-sm font-medium text-slate-500 truncate">Credit Score</dt>
                        <dd className="text-lg font-medium text-slate-900" data-testid="text-credit-score">
                          {statsLoading ? "..." : stats?.creditScore || 600}
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
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500 truncate">Group Orders</dt>
                        <dd className="text-lg font-medium text-slate-900" data-testid="text-group-orders">
                          {statsLoading ? "..." : stats?.groupOrders || 0}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Orders Section - Takes 2 columns */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Recent Orders</CardTitle>
                        <p className="text-sm text-slate-600 mt-1">
                          Track your purchase history and delivery status
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" data-testid="button-view-all-orders">
                        View All Orders
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <OrderTable 
                      orders={recentOrders}
                      onTrackOrder={(orderId) => {
                        toast({ title: "Tracking order", description: `Tracking order ${orderId}` });
                      }}
                      onRateSupplier={(orderId) => {
                        toast({ title: "Rate supplier", description: `Rating supplier for order ${orderId}` });
                      }}
                      onReorder={(orderId) => {
                        toast({ title: "Reordering", description: `Reordering from order ${orderId}` });
                      }}
                      onCancelOrder={(orderId) => {
                        toast({ title: "Cancelling order", description: `Cancelling order ${orderId}` });
                      }}
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar Content */}
              <div className="space-y-6">
                {/* Active Group Orders */}
                <Card>
                  <CardHeader>
                    <CardTitle>Active Group Orders</CardTitle>
                    <p className="text-sm text-slate-600">
                      Join bulk purchases for better prices
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {groupOrdersLoading ? (
                      <div className="text-center py-4 text-slate-500">Loading...</div>
                    ) : activeGroupOrders.length === 0 ? (
                      <div className="text-center py-4 text-slate-500">
                        No active group orders
                      </div>
                    ) : (
                      activeGroupOrders.map((groupOrder) => (
                        <GroupOrderCard
                          key={groupOrder.id}
                          groupOrder={groupOrder}
                          onJoin={(groupOrderId) => {
                            toast({ 
                              title: "Joining group order", 
                              description: `Joining group order ${groupOrderId}` 
                            });
                          }}
                        />
                      ))
                    )}
                  </CardContent>
                </Card>

                {/* Price Alerts */}
                <Card>
                  <CardHeader>
                    <CardTitle>Price Alerts</CardTitle>
                    <p className="text-sm text-slate-600">
                      Track price changes for your key products
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-slate-900">Onion Prices</h5>
                        <p className="text-sm text-slate-600">₹25/kg current</p>
                      </div>
                      <Badge variant="secondary">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        -8%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-slate-900">Rice Prices</h5>
                        <p className="text-sm text-slate-600">₹85/kg current</p>
                      </div>
                      <Badge variant="destructive">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12%
                      </Badge>
                    </div>
                    <Button variant="outline" className="w-full" data-testid="button-manage-alerts">
                      Manage Alerts
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
