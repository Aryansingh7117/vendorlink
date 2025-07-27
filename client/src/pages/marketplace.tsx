import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import ProductCard from "@/components/product-card";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Search, Filter } from "lucide-react";
import type { Category, Product } from "@shared/schema";
import { addToCart } from "@/utils/cart";

export default function Marketplace() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: apiProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", searchTerm, selectedCategory, priceRange.min, priceRange.max],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (selectedCategory && selectedCategory !== "all") params.append('categoryId', selectedCategory);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  // Combine API products with vendor listings from localStorage
  const vendorListings = JSON.parse(localStorage.getItem('vendor_listings') || '[]');
  let products = [
    ...apiProducts,
    ...vendorListings.map((listing: any) => ({
      id: listing.id,
      name: listing.name,
      description: listing.description,
      supplier: { businessName: "Various Suppliers", rating: 4.2 },
      category: { name: listing.category },
      pricePerUnit: listing.price,
      unit: listing.unit,
      minimumOrderQuantity: listing.minOrder,
      availableQuantity: listing.stock
    }))
  ];

  // Filter products based on search criteria
  products = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier?.businessName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || 
      product.category?.name === selectedCategory;
    
    const price = parseFloat(product.pricePerUnit.toString());
    const matchesMinPrice = !priceRange.min || price >= parseFloat(priceRange.min);
    const matchesMaxPrice = !priceRange.max || price <= parseFloat(priceRange.max);
    
    return matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice;
  });

  // Sort products based on sortBy value
  products = products.sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.pricePerUnit.toString()) - parseFloat(b.pricePerUnit.toString());
      case 'price-high':
        return parseFloat(b.pricePerUnit.toString()) - parseFloat(a.pricePerUnit.toString());
      case 'rating':
        return (b.supplier?.rating || 4.2) - (a.supplier?.rating || 4.2);
      case 'quality':
        return (b.supplier?.rating || 4.2) - (a.supplier?.rating || 4.2);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: { productId: string; quantity: number; supplierId: string }) => {
      await apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({ title: "Order placed successfully!" });
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
        description: "Failed to place order",
        variant: "destructive",
      });
    },
  });

  const handleAddToCart = (product: any) => {
    // Use centralized cart utility
    addToCart(product);
    
    // Show immediate feedback for cart addition
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart`,
    });
    
    // Show cart access hint after 2 seconds
    setTimeout(() => {
      toast({
        title: "Quick Access",
        description: "View your cart from the shopping bag icon in the navigation",
      });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white">Product Marketplace</CardTitle>
                <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                  Find and compare suppliers for your business needs
                </p>
              </CardHeader>
              
              {/* Search and Filters */}
              <div className="px-6 py-4 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="Search products (e.g., onions, rice, oil)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                        data-testid="input-search-products"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                        <Search className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-48" data-testid="select-category">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-48" data-testid="select-sort">
                        <SelectValue placeholder="Sort by..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name A-Z</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="rating">Rating: High to Low</SelectItem>
                        <SelectItem value="quality">Quality Score</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min ₹"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                        className="w-24"
                        data-testid="input-min-price"
                      />
                      <Input
                        type="number"
                        placeholder="Max ₹"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                        className="w-24"
                        data-testid="input-max-price"
                      />
                    </div>
                    
                    <Button onClick={() => {
                      toast({
                        title: "Find Suppliers",
                        description: "Opening supplier directory with your search criteria...",
                      });
                      setTimeout(() => {
                        window.location.href = "/saved-suppliers";
                      }, 1000);
                    }}>
                      <Search className="mr-2 h-4 w-4" />
                      Find Suppliers
                    </Button>
                  </div>
                </div>
              </div>

              {/* Product Listings */}
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-slate-500">Loading products...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="space-y-4">
                    {/* Show sample products when no real ones exist */}
                    {[
                      {
                        id: "sample-1",
                        name: "Premium Basmati Rice",
                        description: "High-quality aromatic basmati rice, perfect for biryanis and pulao",
                        pricePerUnit: "85.00",
                        unit: "kg",
                        availableQuantity: 500,
                        minimumOrderQuantity: 10,
                        supplierId: "supplier-1",
                        categoryId: "grains",
                        imageUrl: null
                      },
                      {
                        id: "sample-2",
                        name: "Pure Sunflower Oil",
                        description: "Cold-pressed sunflower oil, rich in Vitamin E",
                        pricePerUnit: "120.00",
                        unit: "L",
                        availableQuantity: 200,
                        minimumOrderQuantity: 5,
                        supplierId: "supplier-2", 
                        categoryId: "oils",
                        imageUrl: null
                      },
                      {
                        id: "sample-3",
                        name: "Fresh Red Onions",
                        description: "Farm-fresh red onions, Grade A quality",
                        pricePerUnit: "35.00",
                        unit: "kg",
                        availableQuantity: 1000,
                        minimumOrderQuantity: 25,
                        supplierId: "supplier-3",
                        categoryId: "vegetables",
                        imageUrl: null
                      },
                      {
                        id: "sample-4",
                        name: "Organic Wheat Flour", 
                        description: "Stone-ground organic wheat flour, chemical-free",
                        pricePerUnit: "45.00",
                        unit: "kg",
                        availableQuantity: 300,
                        minimumOrderQuantity: 20,
                        supplierId: "supplier-1",
                        categoryId: "grains",
                        imageUrl: null
                      }
                    ].map((product) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          ...product,
                          supplier: {
                            businessName: `Supplier ${product.id.slice(-1)}`,
                            isVerified: true,
                            rating: parseFloat((4.2 + Math.random() * 0.6).toFixed(1)),
                            reviewCount: Math.floor(Math.random() * 150) + 50,
                          },
                          distance: Math.floor(Math.random() * 15) + 1,
                        }}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={{
                          ...product,
                          supplier: {
                            businessName: `Supplier ${product.id.slice(-4)}`,
                            isVerified: Math.random() > 0.3,
                            rating: parseFloat((4 + Math.random()).toFixed(1)),
                            reviewCount: Math.floor(Math.random() * 200) + 20,
                          },
                          distance: Math.floor(Math.random() * 15) + 1,
                        }}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
