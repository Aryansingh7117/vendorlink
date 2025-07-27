import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Star, MapPin, Phone, Mail, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SavedSuppliers() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<string>("name");
  
  // Get vendor listings from localStorage and convert them to supplier format
  const getVendorListingsAsSuppliers = () => {
    const vendorListings = JSON.parse(localStorage.getItem('vendor_listings') || '[]');
    return vendorListings.map((listing: any, index: number) => ({
      id: `vendor-${listing.id}`,
      businessName: `${listing.category} Supplier ${index + 1}`,
      rating: 4.0 + Math.random() * 1.0,
      reviewCount: Math.floor(Math.random() * 100) + 20,
      location: "Mumbai, Maharashtra",
      phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
      email: `supplier${index + 1}@${listing.category.toLowerCase().replace(' ', '')}.com`,
      specialties: [listing.category, listing.name],
      isVerified: Math.random() > 0.3,
      isSaved: false,
    }));
  };

  const [savedSuppliers, setSavedSuppliers] = useState([
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
      isSaved: true,
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
      isSaved: true,
    },
    {
      id: "3",
      businessName: "Spice Masters Co",
      rating: 4.9,
      reviewCount: 203,
      location: "Chennai, Tamil Nadu",
      phone: "+91 76543 21098",
      email: "orders@spicemasters.com",
      specialties: ["Spices", "Condiments", "Masala Powders"],
      isVerified: true,
      isSaved: false,
    }
  ]);

  // Update suppliers list when vendor listings change
  useEffect(() => {
    const baseSuppliers = [
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
        isSaved: true,
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
        isSaved: true,
      },
      {
        id: "3",
        businessName: "Spice Masters Co",
        rating: 4.9,
        reviewCount: 203,
        location: "Chennai, Tamil Nadu",
        phone: "+91 76543 21098",
        email: "orders@spicemasters.com",
        specialties: ["Spices", "Condiments", "Masala Powders"],
        isVerified: true,
        isSaved: false,
      }
    ];
    
    setSavedSuppliers([...baseSuppliers, ...getVendorListingsAsSuppliers()]);
  }, []);

  const toggleSaved = (id: string) => {
    setSavedSuppliers(suppliers => 
      suppliers.map(supplier => {
        if (supplier.id === id) {
          const newSavedStatus = !supplier.isSaved;
          toast({
            title: newSavedStatus ? "Supplier Saved" : "Supplier Removed",
            description: `${supplier.businessName} ${newSavedStatus ? 'added to' : 'removed from'} your saved suppliers`,
          });
          return { ...supplier, isSaved: newSavedStatus };
        }
        return supplier;
      })
    );
  };

  // Filter suppliers based on search term - this makes search actually work
  let filteredSuppliers = savedSuppliers.filter(supplier => {
    if (!searchTerm.trim()) return true; // Show all if no search term
    
    const searchLower = searchTerm.toLowerCase();
    return (
      supplier.businessName.toLowerCase().includes(searchLower) ||
      supplier.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchLower)
      ) ||
      supplier.location.toLowerCase().includes(searchLower) ||
      supplier.email.toLowerCase().includes(searchLower)
    );
  });

  // Apply sorting - this ensures the dropdown actually works
  filteredSuppliers = [...filteredSuppliers].sort((a, b) => {
    switch (sortBy) {
      case 'rating-high':
        return b.rating - a.rating;
      case 'rating-low':
        return a.rating - b.rating;
      case 'reviews':
        return b.reviewCount - a.reviewCount;
      case 'location':
        return a.location.localeCompare(b.location);
      case 'name':
      default:
        return a.businessName.localeCompare(b.businessName);
    }
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Find Suppliers</h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
                    Discover and connect with verified suppliers
                  </p>
                </div>
                <div className="mt-4 lg:mt-0 lg:ml-6 flex gap-4">
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Search suppliers, products, or location..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full lg:w-80 pl-10"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                      <Search className="h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name A-Z</SelectItem>
                      <SelectItem value="rating-high">Rating: High to Low</SelectItem>
                      <SelectItem value="rating-low">Rating: Low to High</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                      <SelectItem value="location">Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredSuppliers.length === 0 ? (
                <div className="text-center py-12 text-slate-500 dark:text-gray-400">
                  <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                  <p>No suppliers found matching your search</p>
                  <p className="text-sm">Try different keywords or browse all suppliers</p>
                </div>
              ) : (
                filteredSuppliers.map((supplier) => (
                <Card key={supplier.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <CardTitle className="text-lg dark:text-white">{supplier.businessName}</CardTitle>
                        {supplier.isVerified && (
                          <div className="flex items-center text-blue-600">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="text-xs ml-1">Verified</span>
                          </div>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleSaved(supplier.id)}
                      >
                        <Heart className={`h-4 w-4 ${supplier.isSaved ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center text-sm text-slate-600 dark:text-gray-300">
                          <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                          {supplier.rating.toFixed(1)} ({supplier.reviewCount} reviews)
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-gray-300">
                          <MapPin className="h-4 w-4 mr-2" />
                          {supplier.location}
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-gray-300">
                          <Phone className="h-4 w-4 mr-2" />
                          {supplier.phone}
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-gray-300">
                          <Mail className="h-4 w-4 mr-2" />
                          {supplier.email}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">Specialties</h4>
                        <div className="flex flex-wrap gap-1">
                          {supplier.specialties.map((specialty, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <Button onClick={() => {
                        toast({
                          title: "Viewing Products",
                          description: `Opening ${supplier.businessName}'s product catalog`,
                        });
                        // Navigate to supplier catalog page
                        window.location.href = `/supplier-catalog/${supplier.id}`;
                      }}>
                        View Products
                      </Button>
                      <Button variant="outline" onClick={() => {
                        // Open email client with pre-filled message
                        const subject = encodeURIComponent(`Business Inquiry - VendorLink`);
                        const body = encodeURIComponent(`Hi ${supplier.businessName},\n\nI'm interested in your products and would like to discuss potential business opportunities.\n\nYou can also reach me at ${supplier.phone}\n\nBest regards`);
                        window.open(`mailto:${supplier.email}?subject=${subject}&body=${body}`, '_blank');
                        
                        toast({
                          title: "Email Client Opened",
                          description: `Composing email to ${supplier.businessName}`,
                        });
                      }}>
                        Contact Supplier
                      </Button>
                      <Button 
                        variant="ghost" 
                        onClick={() => toggleSaved(supplier.id)}
                        className={supplier.isSaved ? "text-red-600" : "text-blue-600"}
                      >
                        {supplier.isSaved ? "Remove from Saved" : "Save Supplier"}
                      </Button>
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