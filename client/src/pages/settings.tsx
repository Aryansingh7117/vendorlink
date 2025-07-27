import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Building, Bell, Shield, CreditCard, Download, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Settings() {
  const { toast } = useToast();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
              <p className="mt-1 text-sm text-slate-600">
                Manage your account preferences and business settings
              </p>
            </div>

            <div className="grid gap-6">
              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" defaultValue="John" />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" defaultValue="Doe" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+91 98765 43210" />
                  </div>
                </CardContent>
              </Card>

              {/* Business Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="businessName">Business Name</Label>
                    <Input id="businessName" defaultValue="Acme Trading Co." />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type</Label>
                    <Select defaultValue="vendor">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vendor">Vendor</SelectItem>
                        <SelectItem value="supplier">Supplier</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea id="address" defaultValue="123 Business Street, Commercial District" />
                  </div>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" defaultValue="Mumbai" />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" defaultValue="Maharashtra" />
                    </div>
                    <div>
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input id="pincode" defaultValue="400001" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notification Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Bell className="h-5 w-5 mr-2" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="orderUpdates">Order Updates</Label>
                      <p className="text-sm text-slate-600">Get notified about order status changes</p>
                    </div>
                    <Switch id="orderUpdates" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="priceAlerts">Price Alerts</Label>
                      <p className="text-sm text-slate-600">Receive alerts when target prices are reached</p>
                    </div>
                    <Switch id="priceAlerts" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="groupOrders">Group Order Invitations</Label>
                      <p className="text-sm text-slate-600">Get invited to relevant group orders</p>
                    </div>
                    <Switch id="groupOrders" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketing">Marketing Communications</Label>
                      <p className="text-sm text-slate-600">Receive newsletters and promotional offers</p>
                    </div>
                    <Switch id="marketing" />
                  </div>
                </CardContent>
              </Card>

              {/* Security Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Security & Privacy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input id="current-password" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="new-password">New Password</Label>
                          <Input id="new-password" type="password" />
                        </div>
                        <div>
                          <Label htmlFor="confirm-password">Confirm New Password</Label>
                          <Input id="confirm-password" type="password" />
                        </div>
                        <Button className="w-full" onClick={() => {
                          toast({
                            title: "Password Changed",
                            description: "Your password has been updated successfully.",
                          });
                        }}>
                          Update Password
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-auto">
                        {twoFactorEnabled ? "Disable" : "Enable"} Two-Factor Authentication
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Two-Factor Authentication</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {!twoFactorEnabled ? (
                          <>
                            <p className="text-sm text-gray-600">
                              Scan this QR code with your authenticator app:
                            </p>
                            <div className="w-32 h-32 bg-gray-100 mx-auto flex items-center justify-center">
                              <span className="text-xs text-gray-500">QR Code</span>
                            </div>
                            <div>
                              <Label htmlFor="verification-code">Enter verification code</Label>
                              <Input id="verification-code" placeholder="6-digit code" />
                            </div>
                            <Button className="w-full" onClick={() => {
                              setTwoFactorEnabled(true);
                              toast({
                                title: "Two-Factor Enabled",
                                description: "Two-factor authentication has been enabled for your account.",
                              });
                            }}>
                              Enable Two-Factor
                            </Button>
                          </>
                        ) : (
                          <>
                            <p className="text-sm text-gray-600">
                              Two-factor authentication is currently enabled for your account.
                            </p>
                            <Button 
                              variant="destructive" 
                              className="w-full" 
                              onClick={() => {
                                setTwoFactorEnabled(false);
                                toast({
                                  title: "Two-Factor Disabled",
                                  description: "Two-factor authentication has been disabled.",
                                });
                              }}
                            >
                              Disable Two-Factor
                            </Button>
                          </>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>

                  <Button variant="outline" className="w-full sm:w-auto" onClick={() => {
                    const userData = {
                      profile: {
                        firstName: "John",
                        lastName: "Doe",
                        email: "john.doe@example.com"
                      },
                      business: {
                        name: "Acme Trading Co.",
                        type: "vendor"
                      },
                      settings: {
                        notifications: true,
                        twoFactor: twoFactorEnabled
                      },
                      exportDate: new Date().toISOString()
                    };
                    
                    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `vendorlink-data-${new Date().toISOString().split('T')[0]}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    toast({
                      title: "Data Downloaded",
                      description: "Your account data has been downloaded successfully.",
                    });
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Download My Data
                  </Button>
                </CardContent>
              </Card>

              {/* Save Button */}
              <div className="flex justify-end">
                <Button onClick={() => {
                  toast({
                    title: "Settings Saved",
                    description: "All your settings have been saved successfully.",
                  });
                }}>Save Changes</Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}