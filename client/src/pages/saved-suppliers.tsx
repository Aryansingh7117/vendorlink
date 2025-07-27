import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Star, MapPin, Phone, Mail } from "lucide-react";

export default function SavedSuppliers() {
  const savedSuppliers = [
    {
      id: "1",
      businessName: "Fresh Farm Supplies",
      rating: 4.8,
      reviewCount: 156,
      location: "Mumbai, Maharashtra",
      phone: "+91 98765 43210",
      email: "contact@freshfarm.com",
      specialties: ["Organic Vegetables", "Dairy Products", "Fresh Fruits"],
      isVerified: true,
    },
    {
      id: "2", 
      businessName: "Global Trade Solutions",
      rating: 4.6,
      reviewCount: 89,
      location: "Delhi, NCR",
      phone: "+91 87654 32109",
      email: "info@globaltrade.com",
      specialties: ["Electronics", "Industrial Equipment", "Raw Materials"],
      isVerified: true,
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Saved Suppliers</h1>
              <p className="mt-1 text-sm text-slate-600">
                Your bookmarked suppliers for quick access
              </p>
            </div>

            <div className="grid gap-6">
              {savedSuppliers.map((supplier) => (
                <Card key={supplier.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg">{supplier.businessName}</CardTitle>
                        {supplier.isVerified && (
                          <div className="flex items-center text-blue-600">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-xs ml-1">Verified</span>
                          </div>
                        )}
                      </div>
                      <Button variant="ghost" size="sm">
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-slate-600">
                          <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                          {supplier.rating} ({supplier.reviewCount} reviews)
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <MapPin className="h-4 w-4 mr-2" />
                          {supplier.location}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Phone className="h-4 w-4 mr-2" />
                          {supplier.phone}
                        </div>
                        <div className="flex items-center text-sm text-slate-600">
                          <Mail className="h-4 w-4 mr-2" />
                          {supplier.email}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-1">
                          {supplier.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button>View Products</Button>
                      <Button variant="outline">Contact Supplier</Button>
                      <Button variant="ghost">Remove from Saved</Button>
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