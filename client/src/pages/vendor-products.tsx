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
import { Plus, Package, Edit, Eye, Archive, Upload, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";

interface VendorProduct {
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

export default function VendorProducts() {
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [products, setProducts] = useState<VendorProduct[]>([
    {
      id: "1",
      name: "Bulk Office Supplies",
      description: "Complete office stationery package including pens, papers, folders",
      category: "Office Supplies",
      price: 2500,
      unit: "package",
      stock: 50,
      minOrder: 1,
      status: "active",
      orders: 12
    },
    {
      id: "2", 
      name: "Industrial Safety Equipment",
      description: "Safety helmets, gloves, and protective gear for industrial use",
      category: "Safety Equipment",
      price: 850,
      unit: "set",
      stock: 25,
      minOrder: 2,
      status: "active",
      orders: 8
    },
    {
      id: "3",
      name: "Restaurant Kitchen Utensils",
      description: "Professional-grade kitchen utensils for restaurants",
      category: "Kitchen Equipment",
      price: 1200,
      unit: "set", 
      stock: 0,
      minOrder: 1,
      status: "out_of_stock",
      orders: 5
    }
  ]);

  const addForm = useForm({
    defaultValues: {
      name: "",
      description: "",
      category: "",
      price: "",
      unit: "package",
      stock: "",
      minOrder: "",
    }
  });

  const onAddSubmit = (data: any) => {
    const newProduct: VendorProduct = {
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
    
    // Also save to localStorage to show in marketplace/find suppliers
    const existingListings = JSON.parse(localStorage.getItem('vendor_listings') || '[]');
    existingListings.push(newProduct);
    localStorage.setItem('vendor_listings', JSON.stringify(existingListings));
    
    toast({
      title: "Product Listed!",
      description: `${data.name} has been added to your catalog and is now visible to suppliers in the marketplace`,
    });
  };

  const updateProductStatus = (id: string, status: VendorProduct['status']) => {
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
    if (stock < 10) {
      return <Badge variant="destructive">Low Stock</Badge>;
    }
    return <Badge variant="default">Available</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="flex">
        <Sidebar userRole="vendor" />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">My Product Listings</h1>
                  <p className="mt-1 text-sm text-slate-600">
                    List your products for suppliers to discover and quote
                  </p>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      List Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>List New Product Request</DialogTitle>
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
                                  <Input placeholder="e.g., Bulk Office Supplies" {...field} />
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
                                    <SelectItem value="office">Office Supplies</SelectItem>
                                    <SelectItem value="safety">Safety Equipment</SelectItem>
                                    <SelectItem value="kitchen">Kitchen Equipment</SelectItem>
                                    <SelectItem value="electronics">Electronics</SelectItem>
                                    <SelectItem value="machinery">Machinery</SelectItem>
                                    <SelectItem value="textiles">Textiles</SelectItem>
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
                                <Textarea placeholder="Describe what you need..." {...field} />
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
                                <FormLabel>Budget (₹)</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="2500" {...field} />
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
                                <Select onValueChange={field.onChange} defaultValue="package">
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="package">Package</SelectItem>
                                    <SelectItem value="set">Set</SelectItem>
                                    <SelectItem value="piece">Piece</SelectItem>
                                    <SelectItem value="kg">Kilogram</SelectItem>
                                    <SelectItem value="unit">Unit</SelectItem>
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
                                <FormLabel>Quantity Needed</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="50" {...field} />
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
                                <FormLabel>Min Quantity</FormLabel>
                                <FormControl>
                                  <Input type="number" placeholder="1" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button type="submit" className="flex-1">List Product Request</Button>
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
                        <ShoppingBag className="h-5 w-5 mr-2" />
                        {product.name}
                      </CardTitle>
                      {getStatusBadge(product.status, product.stock)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4">{product.description}</p>
                    
                    <div className="grid md:grid-cols-4 gap-6 mb-6">
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-1">Budget</h4>
                        <p className="text-xl font-bold">₹{product.price}</p>
                        <p className="text-sm text-slate-600">per {product.unit}</p>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-1">Quantity Needed</h4>
                        <p className="text-xl font-bold">{product.stock}</p>
                        <p className="text-sm text-slate-600">{product.unit}s required</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-1">Quotes Received</h4>
                        <p className="text-xl font-bold">{product.orders}</p>
                        <p className="text-sm text-slate-600">from suppliers</p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-slate-900 mb-1">Min Quantity</h4>
                        <p className="text-xl font-bold">{product.minOrder}</p>
                        <p className="text-sm text-slate-600">{product.unit}s minimum</p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View Quotes ({product.orders})
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <DialogHeader>
                            <DialogTitle>Supplier Quotes for {product.name}</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            {Array.from({length: product.orders}, (_, i) => (
                              <Card key={i}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-semibold">Supplier {i + 1}</h4>
                                      <p className="text-sm text-gray-600">Price: ₹{product.price - (i * 10)}</p>
                                      <p className="text-sm text-gray-600">Delivery: {3 + i} business days</p>
                                    </div>
                                    <Button size="sm">Accept Quote</Button>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Edit Product Listing</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="edit-name">Product Name</Label>
                              <Input id="edit-name" defaultValue={product.name} />
                            </div>
                            <div>
                              <Label htmlFor="edit-desc">Description</Label>
                              <Textarea id="edit-desc" defaultValue={product.description} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="edit-price">Budget (₹)</Label>
                                <Input id="edit-price" type="number" defaultValue={product.price} />
                              </div>
                              <div>
                                <Label htmlFor="edit-stock">Quantity</Label>
                                <Input id="edit-stock" type="number" defaultValue={product.stock} />
                              </div>
                            </div>
                            <Button className="w-full" onClick={() => {
                              const nameInput = document.getElementById('edit-name') as HTMLInputElement;
                              const descInput = document.getElementById('edit-desc') as HTMLTextAreaElement;
                              const priceInput = document.getElementById('edit-price') as HTMLInputElement;
                              const stockInput = document.getElementById('edit-stock') as HTMLInputElement;
                              
                              const updatedProducts = products.map(p => 
                                p.id === product.id 
                                  ? { 
                                      ...p, 
                                      name: nameInput?.value || p.name,
                                      description: descInput?.value || p.description,
                                      price: parseFloat(priceInput?.value) || p.price,
                                      stock: parseInt(stockInput?.value) || p.stock
                                    }
                                  : p
                              );
                              setProducts(updatedProducts);
                              
                              // Update localStorage as well
                              const existingListings = JSON.parse(localStorage.getItem('vendor_listings') || '[]');
                              const updatedListings = existingListings.map((listing: any) =>
                                listing.id === product.id
                                  ? {
                                      ...listing,
                                      name: nameInput?.value || listing.name,
                                      description: descInput?.value || listing.description,
                                      price: parseFloat(priceInput?.value) || listing.price,
                                      stock: parseInt(stockInput?.value) || listing.stock
                                    }
                                  : listing
                              );
                              localStorage.setItem('vendor_listings', JSON.stringify(updatedListings));
                              
                              toast({
                                title: "Listing Updated",
                                description: "Your product listing has been updated successfully.",
                              });
                            }}>
                              Update Listing
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
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