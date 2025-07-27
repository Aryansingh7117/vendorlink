import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, TrendingUp, TrendingDown, Minus, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function PriceTracking() {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState([
    {
      id: "1",
      productName: "Basmati Rice Premium",
      currentPrice: 85,
      targetPrice: 80,
      supplier: "Fresh Farm Supplies",
      trend: "down",
      changePercent: -5.2,
      status: "active"
    },
    {
      id: "2",
      productName: "Sunflower Oil 1L",
      currentPrice: 120,
      targetPrice: 115,
      supplier: "Global Trade Solutions", 
      trend: "up",
      changePercent: 2.8,
      status: "triggered"
    },
    {
      id: "3",
      productName: "Red Onions",
      currentPrice: 35,
      targetPrice: 30,
      supplier: "Veggie World",
      trend: "stable",
      changePercent: 0,
      status: "active"
    }
  ]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <TrendingUp className="h-4 w-4 text-red-500" />;
      case "down": return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "triggered" ? (
      <Badge variant="destructive">Target Reached</Badge>
    ) : (
      <Badge variant="outline">Active</Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">Price Tracking</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Monitor price changes and get alerts when your target prices are reached
                  </p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Target className="h-4 w-4 mr-2" />
                      Create Alert
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create Price Alert</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="product">Product Name</Label>
                        <Input id="product" placeholder="e.g., Premium Basmati Rice" />
                      </div>
                      <div>
                        <Label htmlFor="target-price">Target Price (₹)</Label>
                        <Input id="target-price" type="number" placeholder="e.g., 80" />
                      </div>
                      <div>
                        <Label htmlFor="condition">Alert Condition</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select condition" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="below">Notify when price drops below target</SelectItem>
                            <SelectItem value="above">Notify when price goes above target</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button className="w-full" onClick={() => {
                        const newAlert = {
                          id: Date.now().toString(),
                          productName: "New Product Alert",
                          currentPrice: 100,
                          targetPrice: 90,
                          supplier: "Various Suppliers",
                          trend: "stable" as const,
                          changePercent: 0,
                          status: "active" as const
                        };
                        setAlerts([...alerts, newAlert]);
                        toast({
                          title: "Price Alert Created",
                          description: "You'll be notified when the price condition is met",
                        });
                      }}>
                        Create Alert
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid gap-6">
              {alerts.map((alert) => (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{alert.productName}</CardTitle>
                      {getStatusBadge(alert.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Current Price</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">₹{alert.currentPrice}</span>
                          <div className="flex items-center">
                            {getTrendIcon(alert.trend)}
                            <span className={`text-sm ml-1 ${
                              alert.trend === "up" ? "text-red-500" : 
                              alert.trend === "down" ? "text-green-500" : "text-slate-500"
                            }`}>
                              {alert.changePercent > 0 ? "+" : ""}{alert.changePercent}%
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">from {alert.supplier}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Target Price</h4>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold text-blue-600">₹{alert.targetPrice}</span>
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {alert.currentPrice <= alert.targetPrice ? "Target reached!" : 
                           `₹${alert.currentPrice - alert.targetPrice} above target`}
                        </p>
                      </div>

                      <div className="flex items-end">
                        <div className="flex gap-2 w-full">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="flex-1">
                                <Bell className="h-4 w-4 mr-1" />
                                Edit Alert
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Price Alert</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label>Product Name</Label>
                                  <Input defaultValue={alert.productName} />
                                </div>
                                <div>
                                  <Label>Target Price (₹)</Label>
                                  <Input type="number" defaultValue={alert.targetPrice} />
                                </div>
                                <Button className="w-full" onClick={() => {
                                  toast({
                                    title: "Alert Updated",
                                    description: `Price alert for ${alert.productName} has been updated`,
                                  });
                                }}>
                                  Update Alert
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                              setAlerts(alerts.filter(a => a.id !== alert.id));
                              toast({
                                title: "Alert Removed",
                                description: `Price alert for ${alert.productName} has been removed`,
                              });
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}