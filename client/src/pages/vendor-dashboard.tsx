import { useEffect, useState } from "react";
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
import { LoadingGrid, LoadingSpinner } from "@/components/loading-card";
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
  const [pageLoading, setPageLoading] = useState(true);

  // Add page loading delay for smooth transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

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

  const { data: groupOrders = [], isLoading: groupOrdersLoading, refetch: refetchGroupOrders } = useQuery({
    queryKey: ["/api/group-orders"],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  const { data: orders = [], isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["/api/orders"],
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Listen for cart updates to refresh dashboard
  useEffect(() => {
    const handleCartUpdate = () => {
      refetchOrders();
      refetchGroupOrders();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, [refetchOrders, refetchGroupOrders]);

  if (isLoading || pageLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  const recentOrders = orders.slice(0, 5);
  const activeGroupOrders = groupOrders.slice(0, 2);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 animate-fade-in">
      <Navigation />
      <div className="flex">
        <Sidebar userRole="vendor" />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            {/* Dashboard Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white" data-testid="text-dashboard-title">
                    Vendor Dashboard
                  </h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-slide-up">
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
                        <dt className="text-sm font-medium text-slate-500 dark:text-gray-400 truncate">Active Orders</dt>
                        <dd className="text-lg font-medium text-slate-900 dark:text-white" data-testid="text-active-orders">
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
                        <dt className="text-sm font-medium text-slate-500 dark:text-gray-400 truncate">Monthly Savings</dt>
                        <dd className="text-lg font-medium text-slate-900 dark:text-white" data-testid="text-monthly-savings">
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
                        <dt className="text-sm font-medium text-slate-500 dark:text-gray-400 truncate">Credit Score</dt>
                        <dd className="text-lg font-medium text-slate-900 dark:text-white" data-testid="text-credit-score">
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
                        <dt className="text-sm font-medium text-slate-500 dark:text-gray-400 truncate">Group Orders</dt>
                        <dd className="text-lg font-medium text-slate-900 dark:text-white" data-testid="text-group-orders">
                          {groupOrdersLoading ? "..." : groupOrders?.length || 0}
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
                        <CardTitle className="dark:text-white">Recent Orders</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
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
                    <CardTitle className="dark:text-white">Active Group Orders</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-gray-300">
                      Join bulk purchases for better prices
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {groupOrdersLoading ? (
                      <div className="text-center py-4 text-slate-500 dark:text-gray-400">Loading...</div>
                    ) : activeGroupOrders.length === 0 ? (
                      <div className="text-center py-4 text-slate-500 dark:text-gray-400">
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
                    <CardTitle className="dark:text-white">Price Alerts</CardTitle>
                    <p className="text-sm text-slate-600 dark:text-gray-300">
                      Track price changes for your key products
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-slate-900 dark:text-white">Onion Prices</h5>
                        <p className="text-sm text-slate-600 dark:text-gray-300">₹25/kg current</p>
                      </div>
                      <Badge variant="secondary">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        -8%
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div>
                        <h5 className="font-medium text-slate-900 dark:text-white">Rice Prices</h5>
                        <p className="text-sm text-slate-600 dark:text-gray-300">₹85/kg current</p>
                      </div>
                      <Badge variant="destructive">
                        <TrendingUp className="w-3 h-3 mr-1" />
                        +12%
                      </Badge>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full" 
                      data-testid="button-manage-alerts"
                      onClick={() => window.location.href = '/price-tracking'}
                    >
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
