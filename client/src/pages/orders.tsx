import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import OrderTable from "@/components/order-table";
import { ShoppingBag } from "lucide-react";

export default function Orders() {
  const { toast } = useToast();

  const { data: vendorOrders = [], isLoading: vendorOrdersLoading } = useQuery({
    queryKey: ["/api/orders", "vendor"],
  });

  const { data: supplierOrders = [], isLoading: supplierOrdersLoading } = useQuery({
    queryKey: ["/api/orders", "supplier"],
  });

  const handleTrackOrder = (orderId: string) => {
    toast({ 
      title: "Tracking Order", 
      description: `Tracking order ${orderId}` 
    });
  };

  const handleRateSupplier = (orderId: string) => {
    toast({ 
      title: "Rate Supplier", 
      description: `Rating supplier for order ${orderId}` 
    });
  };

  const handleReorder = (orderId: string) => {
    toast({ 
      title: "Reordering", 
      description: `Creating new order based on ${orderId}` 
    });
  };

  const handleCancelOrder = (orderId: string) => {
    toast({ 
      title: "Cancel Order", 
      description: `Cancelling order ${orderId}`,
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-slate-900" data-testid="text-orders-title">
                My Orders
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Track and manage all your orders
              </p>
            </div>

            <Tabs defaultValue="vendor" className="space-y-6">
              <TabsList>
                <TabsTrigger value="vendor" data-testid="tab-vendor-orders">
                  As Vendor
                </TabsTrigger>
                <TabsTrigger value="supplier" data-testid="tab-supplier-orders">
                  As Supplier
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="vendor">
                <Card>
                  <CardHeader>
                    <CardTitle>Orders Placed</CardTitle>
                    <p className="text-sm text-slate-600">
                      Orders you've placed with suppliers
                    </p>
                  </CardHeader>
                  <CardContent>
                    {vendorOrdersLoading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="mt-2 text-slate-500">Loading orders...</p>
                      </div>
                    ) : vendorOrders.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>No orders placed yet</p>
                        <p className="text-sm">Start ordering from the marketplace</p>
                      </div>
                    ) : (
                      <OrderTable
                        orders={vendorOrders}
                        onTrackOrder={handleTrackOrder}
                        onRateSupplier={handleRateSupplier}
                        onReorder={handleReorder}
                        onCancelOrder={handleCancelOrder}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="supplier">
                <Card>
                  <CardHeader>
                    <CardTitle>Orders Received</CardTitle>
                    <p className="text-sm text-slate-600">
                      Orders received from vendors for your products
                    </p>
                  </CardHeader>
                  <CardContent>
                    {supplierOrdersLoading ? (
                      <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <p className="mt-2 text-slate-500">Loading orders...</p>
                      </div>
                    ) : supplierOrders.length === 0 ? (
                      <div className="text-center py-12 text-slate-500">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                        <p>No orders received yet</p>
                        <p className="text-sm">Add products to start receiving orders</p>
                      </div>
                    ) : (
                      <OrderTable
                        orders={supplierOrders}
                        onTrackOrder={handleTrackOrder}
                      />
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
