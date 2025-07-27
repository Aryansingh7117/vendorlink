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

export default function Marketplace() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", searchTerm, selectedCategory, priceRange.min, priceRange.max],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('searchTerm', searchTerm);
      if (selectedCategory) params.append('categoryId', selectedCategory);
      if (priceRange.min) params.append('minPrice', priceRange.min);
      if (priceRange.max) params.append('maxPrice', priceRange.max);
      
      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
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
    createOrderMutation.mutate({
      productId: product.id,
      quantity: 1,
      supplierId: product.supplierId,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <Card>
              <CardHeader>
                <CardTitle>Product Marketplace</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
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
                        <SelectItem value="">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
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
                  <div className="text-center py-12 text-slate-500">
                    <Search className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No products found</p>
                    <p className="text-sm">Try adjusting your search criteria</p>
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
                            rating: 4 + Math.random(),
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
