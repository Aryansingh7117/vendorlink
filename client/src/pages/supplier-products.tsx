import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Plus, Package, Edit, Eye, Archive, Upload } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  minOrder: number;
  status: 'active' | 'out_of_stock' | 'archived';
  orders: number;
  image?: string;
}

export default function SupplierProducts() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Premium Basmati Rice",
      description: "High-quality aromatic basmati rice, perfect for biryanis and pulao",
      category: "Grains & Cereals",
      price: 85,
      unit: "kg",
      stock: 500,
      minOrder: 10,
      status: "active",
      orders: 23
    },
    {
      id: "2", 
      name: "Organic Sunflower Oil",
      description: "Cold-pressed sunflower oil, rich in Vitamin E",
      category: "Oils & Fats",
      price: 120,
      unit: "L",
      stock: 200,
      minOrder: 5,
      status: "active",
      orders: 15
    },
    {
      id: "3",
      name: "Fresh Red Onions",
      description: "Farm-fresh red onions, Grade A quality",
      category: "Vegetables",
      price: 35,
      unit: "kg", 
      stock: 0,
      minOrder: 25,
      status: "out_of_stock",
      orders: 8
    }
  ]);

  const addForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: "",
      unit: "kg",
      stock: "",
      minOrder: "",
    }
  });

  const onAddSubmit = (data: any) => {
    const newProduct: Product = {
      id: (products.length + 1).toString(),
      name: data.name,
      description: data.description,
      category: data.category,
      price: parseFloat(data.price),
      unit: data.unit,
      stock: parseInt(data.stock),
      minOrder: parseInt(data.minOrder),
      status: parseInt(data.stock) > 0 ? "active" : "out_of_stock",
      orders: 0
    };

    setProducts([...products, newProduct]);
    setShowAddDialog(false);
    addForm.reset();
    
    toast({
      title: "Product Added!",
      description: `${data.name} has been added to your product catalog`,
    });
  };

  const updateProductStatus = (id: string, status: Product['status']) => {
    setProducts(products.map(p => p.id === id ? { ...p, status } : p));
    const product = products.find(p => p.id === id);
    toast({
      title: "Product Updated",
      description: `${product?.name} status changed to ${status.replace('_', ' ')}`,
    });
  };

  const getStatusBadge = (status: string, stock: number) => {
    if (status === "out_of_stock" || stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (status === "archived") {
      return <Badge variant="secondary">Archived</Badge>;
    }
    if (stock < 50) {
      return <Badge variant="destructive">Low Stock</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="flex">
        <Sidebar userRole="supplier" />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">My Products</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Manage your product catalog and inventory
                  </p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <Form {...addForm}>
                      <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <FormField
                            control={addForm.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Premium Basmati Rice" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="category"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Category</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="grains">Grains & Cereals</SelectItem>
                                    <SelectItem value="vegetables">Vegetables</SelectItem>
                                    <SelectItem value="fruits">Fruits</SelectItem>
                                    <SelectItem value="oils">Oils & Fats</SelectItem>
                                    <SelectItem value="dairy">Dairy Products</SelectItem>
                                    <SelectItem value="spices">Spices & Condiments</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={addForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Describe your product..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid md:grid-cols-4 gap-4">
                          <FormField
                            control={addForm.control}
                            name="price"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Price (₹)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="85" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="unit"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Unit</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue="kg">
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                                    <SelectItem value="L">Liter (L)</SelectItem>
                                    <SelectItem value="g">Gram (g)</SelectItem>
                                    <SelectItem value="piece">Piece</SelectItem>
                                    <SelectItem value="dozen">Dozen</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="stock"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Stock</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="500" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addForm.control}
                            name="minOrder"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Min Order</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="10" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button type="submit" className="flex-1">Add Product</Button>
                          <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            <div className="grid gap-6">
              {products.map((product) => (
                <Card key={product.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <Package className="h-5 w-5 mr-2" />
                        {product.name}
                      </CardTitle>
                      {getStatusBadge(product.status, product.stock)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">{product.description}</p>
                    
                    <div className="grid md:grid-cols-4 gap-6 mb-6">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-1">Price</h4>
                        <p className="text-xl font-bold">₹{product.price}</p>
                        <p className="text-sm text-slate-600">per {product.unit}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-1">Stock</h4>
                        <p className="text-xl font-bold">{product.stock}</p>
                        <p className="text-sm text-slate-600">{product.unit}s available</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-1">Orders</h4>
                        <p className="text-xl font-bold">{product.orders}</p>
                        <p className="text-sm text-slate-600">this month</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-1">Min Order</h4>
                        <p className="text-xl font-bold">{product.minOrder}</p>
                        <p className="text-sm text-slate-600">{product.unit}s minimum</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button size="sm" onClick={() => {
                        toast({
                          title: "Edit Product",
                          description: `Opening editor for ${product.name}`,
                        });
                      }}>
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        toast({
                          title: "Product Details",
                          description: `Viewing detailed information for ${product.name}`,
                        });
                      }}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {product.status === 'active' ? (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateProductStatus(product.id, 'archived')}
                        >
                          <Archive className="h-4 w-4 mr-1" />
                          Archive
                        </Button>
                      ) : (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateProductStatus(product.id, 'active')}
                        >
                          Reactivate
                        </Button>
                      )}
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