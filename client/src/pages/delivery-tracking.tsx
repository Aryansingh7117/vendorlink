import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Truck, Package, CheckCircle, Clock, MapPin, Phone, Copy } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function DeliveryTracking() {
  const { toast } = useToast();
  const [trackingId, setTrackingId] = useState("");
  const [trackingData, setTrackingData] = useState<any>(null);

  // Sample tracking data
  const sampleDeliveries = [
    {
      id: "TRK001",
      orderId: "ORD-2024-001",
      carrier: "Express Logistics",
      status: "in-transit",
      progress: 75,
      estimatedDelivery: "Today, 2:00 PM",
      currentLocation: "Mumbai Distribution Center",
      trackingSteps: [
        { status: "Order Confirmed", completed: true, time: "Jan 20, 10:00 AM", location: "VendorLink" },
        { status: "Package Dispatched", completed: true, time: "Jan 20, 2:00 PM", location: "Supplier Warehouse" },
        { status: "In Transit", completed: true, time: "Jan 21, 8:00 AM", location: "Mumbai DC" },
        { status: "Out for Delivery", completed: false, time: "Expected: Jan 21, 12:00 PM", location: "Local Hub" },
        { status: "Delivered", completed: false, time: "Expected: Jan 21, 2:00 PM", location: "Your Address" }
      ]
    }
  ];

  const handleTrackPackage = () => {
    if (!trackingId.trim()) {
      toast({
        title: "Missing Tracking ID",
        description: "Please enter a tracking ID to search",
        variant: "destructive"
      });
      return;
    }

    // Simulate tracking lookup
    const foundDelivery = sampleDeliveries.find(d => d.id === trackingId || d.orderId === trackingId);
    
    if (foundDelivery) {
      setTrackingData(foundDelivery);
      toast({
        title: "Tracking Found",
        description: `Package status: ${foundDelivery.status.replace("-", " ").toUpperCase()}`,
      });
    } else {
      toast({
        title: "Tracking Not Found",
        description: "Please check your tracking ID and try again",
        variant: "destructive"
      });
      setTrackingData(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      "delivered": "default",
      "in-transit": "secondary",
      "pending": "destructive",
      "dispatched": "outline"
    };
    return <Badge variant={variants[status as keyof typeof variants]}>{status.replace("-", " ").toUpperCase()}</Badge>;
  };

  const copyTrackingId = (id: string) => {
    navigator.clipboard.writeText(id);
    toast({
      title: "Copied!",
      description: "Tracking ID copied to clipboard",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Delivery Tracking</h1>
              <p className="text-slate-600 dark:text-gray-300 mt-1">Track your packages in real-time</p>
            </div>

            {/* Tracking Search */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="dark:text-white">Track Your Package</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter tracking ID or order number..."
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleTrackPackage()}
                  />
                  <Button onClick={handleTrackPackage}>
                    <Package className="h-4 w-4 mr-2" />
                    Track Package
                  </Button>
                </div>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-2">
                  Enter your tracking ID (e.g., TRK001) or order number (e.g., ORD-2024-001)
                </p>
              </CardContent>
            </Card>

            {/* Tracking Results */}
            {trackingData && (
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="dark:text-white">Tracking Details</CardTitle>
                    {getStatusBadge(trackingData.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Package Info */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-gray-300">Tracking ID:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{trackingData.id}</span>
                          <Button size="sm" variant="ghost" onClick={() => copyTrackingId(trackingData.id)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-gray-300">Order ID:</span>
                        <span className="font-mono text-sm">{trackingData.orderId}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-gray-300">Carrier:</span>
                        <span className="text-sm">{trackingData.carrier}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-gray-300">Current Location:</span>
                        <span className="text-sm">{trackingData.currentLocation}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-gray-300">Estimated Delivery:</span>
                        <span className="text-sm font-medium text-green-600">{trackingData.estimatedDelivery}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600 dark:text-gray-300">Progress:</span>
                        <span className="text-sm">{trackingData.progress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <Progress value={trackingData.progress} className="h-2" />
                  </div>

                  {/* Tracking Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tracking History</h3>
                    <div className="space-y-4">
                      {trackingData.trackingSteps.map((step: any, index: number) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed 
                              ? 'bg-green-100 text-green-600 dark:bg-green-900/20' 
                              : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
                          }`}>
                            {step.completed ? (
                              <CheckCircle className="h-4 w-4" />
                            ) : (
                              <Clock className="h-4 w-4" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className={`font-medium ${
                                step.completed 
                                  ? 'text-slate-900 dark:text-white' 
                                  : 'text-slate-500 dark:text-gray-400'
                              }`}>
                                {step.status}
                              </h4>
                              <span className="text-sm text-slate-600 dark:text-gray-300">{step.time}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-gray-300 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {step.location}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact Carrier */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-slate-900 dark:text-white mb-2">Need Help?</h4>
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-3">
                      Contact {trackingData.carrier} directly for delivery updates
                    </p>
                    <Button size="sm" variant="outline">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact Carrier
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Deliveries */}
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">Recent Deliveries</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sampleDeliveries.map((delivery) => (
                    <div key={delivery.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Truck className="h-8 w-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-slate-900 dark:text-white">{delivery.orderId}</h4>
                          <p className="text-sm text-slate-600 dark:text-gray-300">{delivery.carrier}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(delivery.status)}
                        <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">{delivery.estimatedDelivery}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}