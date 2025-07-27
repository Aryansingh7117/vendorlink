import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package, Edit, Eye, Archive } from "lucide-react";

export default function MyProducts() {
  const products = [
    {
      id: "1",
      name: "Premium Basmati Rice",
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
      category: "Vegetables",
      price: 35,
      unit: "kg", 
      stock: 0,
      minOrder: 25,
      status: "out_of_stock",
      orders: 8
    }
  ];

  const getStatusBadge = (status: string, stock: number) => {
    if (status === "out_of_stock" || stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (stock < 50) {
      return <Badge variant="destructive">Low Stock</Badge>;
    }
    return <Badge variant="secondary">Active</Badge>;
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
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
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
                    <div className="grid md:grid-cols-4 gap-6">
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

                    <div className="flex gap-3 mt-6">
                      <Button size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Archive className="h-4 w-4 mr-1" />
                        Archive
                      </Button>
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