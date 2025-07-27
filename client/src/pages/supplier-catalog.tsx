import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Package, ShoppingBag, MapPin, Phone, Mail, SortAsc } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { addToCart } from "@/utils/cart";
import { useRoute } from "wouter";
import { useLocation } from "wouter";

export default function SupplierCatalog() {
  const { toast } = useToast();
  const [match, params] = useRoute("/supplier-catalog/:supplierId");
  const [location] = useLocation();
  const supplierId = params?.supplierId || location.split('/').pop();
  const [sortBy, setSortBy] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock supplier data based on ID
  const supplier = {
    id: supplierId,
    businessName: "Fresh Farm Supplies",
    rating: 4.8,
    reviewCount: 156,
    location: "Mumbai, Maharashtra",
    phone: "+91 98765 43210",
    email: "contact@freshfarmsupplies.com",
    description: "Premium quality agricultural products and bulk food supplies for businesses",
    verified: true
  };

  const products = [
    {
      id: "1",
      name: "Premium Basmati Rice",
      category: "Grains",
      price: 85,
      unit: "kg",
      minOrder: 10,
      available: 500,
      image: "/api/placeholder/200/150",
      description: "High-quality aged basmati rice perfect for restaurants and hotels"
    },
    {
      id: "2", 
      name: "Pure Sunflower Oil",
      category: "Oils",
      price: 120,
      unit: "L",
      minOrder: 5,
      available: 200,
      image: "/api/placeholder/200/150",
      description: "Cold-pressed sunflower oil for cooking and food preparation"
    },
    {
      id: "3",
      name: "Fresh Red Onions",
      category: "Vegetables",
      price: 35,
      unit: "kg", 
      minOrder: 25,
      available: 1000,
      image: "/api/placeholder/200/150",
      description: "Farm-fresh red onions, perfect for bulk cooking requirements"
    },
    {
      id: "4",
      name: "Organic Wheat Flour",
      category: "Grains",
      price: 45,
      unit: "kg",
      minOrder: 20,
      available: 300,
      image: "/api/placeholder/200/150", 
      description: "Stone-ground organic wheat flour for bakeries and restaurants"
    }
  ];

  // Filter and sort products
  const filteredProducts = products
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleAddToCart = (product: any) => {
    // Use centralized cart utility
    addToCart(product, supplier.businessName);
    
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            {/* Supplier Header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center">
                        {supplier.businessName}
                        {supplier.verified && (
                          <Badge variant="default" className="ml-2">Verified</Badge>
                        )}
                      </h1>
                      <p className="text-slate-600 dark:text-gray-300 mt-1">{supplier.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="ml-1 text-sm font-medium">{supplier.rating}</span>
                          <span className="text-sm text-slate-600 dark:text-gray-300 ml-1">({supplier.reviewCount} reviews)</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-600 dark:text-gray-300">
                          <MapPin className="h-4 w-4 mr-1" />
                          {supplier.location}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center text-sm text-slate-600 dark:text-gray-300 mb-1">
                      <Phone className="h-4 w-4 mr-1" />
                      {supplier.phone}
                    </div>
                    <div className="flex items-center text-sm text-slate-600 dark:text-gray-300">
                      <Mail className="h-4 w-4 mr-1" />
                      {supplier.email}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Sort Controls */}
            <div className="mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="md:w-80"
              />
              <div className="flex items-center gap-2">
                <SortAsc className="h-4 w-4 text-slate-600 dark:text-gray-300" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Product Catalog */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Product Catalog ({filteredProducts.length})</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-video bg-slate-100 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Package className="h-12 w-12 text-slate-400" />
                      </div>
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg dark:text-white">{product.name}</CardTitle>
                        <Badge variant="outline">{product.category}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mb-3">{product.description}</p>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-gray-300">Price:</span>
                          <span className="font-semibold dark:text-white">₹{product.price}/{product.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-gray-300">Min Order:</span>
                          <span className="dark:text-white">{product.minOrder} {product.unit}s</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600 dark:text-gray-300">Available:</span>
                          <span className="text-green-600">{product.available} {product.unit}s</span>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => handleAddToCart(product)}
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}