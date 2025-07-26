import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import GroupOrderCard from "@/components/group-order-card";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Users, Clock, TrendingUp } from "lucide-react";

const createGroupOrderSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetQuantity: z.number().min(1, "Target quantity must be at least 1"),
  maxParticipants: z.number().min(2, "Must allow at least 2 participants").max(50, "Maximum 50 participants"),
  regularPricePerUnit: z.number().min(0.01, "Regular price must be positive"),
  groupPricePerUnit: z.number().min(0.01, "Group price must be positive"),
  deadline: z.string().min(1, "Deadline is required"),
});

const joinGroupOrderSchema = z.object({
  quantity: z.number().min(1, "Quantity must be at least 1"),
});

export default function GroupOrders() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [selectedGroupOrder, setSelectedGroupOrder] = useState<any>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: groupOrders = [], isLoading: groupOrdersLoading } = useQuery({
    queryKey: ["/api/group-orders"],
    enabled: isAuthenticated,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    enabled: isAuthenticated,
  });

  const createForm = useForm({
    resolver: zodResolver(createGroupOrderSchema),
    defaultValues: {
      productId: "",
      title: "",
      description: "",
      targetQuantity: 100,
      maxParticipants: 10,
      regularPricePerUnit: 0,
      groupPricePerUnit: 0,
      deadline: "",
    },
  });

  const joinForm = useForm({
    resolver: zodResolver(joinGroupOrderSchema),
    defaultValues: {
      quantity: 1,
    },
  });

  const createGroupOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      // Convert deadline string to ISO date
      const deadlineDate = new Date(data.deadline);
      await apiRequest("POST", "/api/group-orders", {
        ...data,
        deadline: deadlineDate.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-orders"] });
      toast({ title: "Group order created successfully!" });
      setShowCreateDialog(false);
      createForm.reset();
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
        description: "Failed to create group order",
        variant: "destructive",
      });
    },
  });

  const joinGroupOrderMutation = useMutation({
    mutationFn: async ({ groupOrderId, quantity }: { groupOrderId: string; quantity: number }) => {
      await apiRequest("POST", `/api/group-orders/${groupOrderId}/join`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/group-orders"] });
      toast({ title: "Successfully joined group order!" });
      setShowJoinDialog(false);
      setSelectedGroupOrder(null);
      joinForm.reset();
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
        description: "Failed to join group order",
        variant: "destructive",
      });
    },
  });

  const handleJoinGroupOrder = (groupOrderId: string) => {
    const groupOrder = groupOrders.find((go: any) => go.id === groupOrderId);
    setSelectedGroupOrder(groupOrder);
    setShowJoinDialog(true);
  };

  const onCreateSubmit = (data: any) => {
    createGroupOrderMutation.mutate(data);
  };

  const onJoinSubmit = (data: any) => {
    if (selectedGroupOrder) {
      joinGroupOrderMutation.mutate({
        groupOrderId: selectedGroupOrder.id,
        quantity: data.quantity,
      });
    }
  };

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  const activeGroupOrders = groupOrders.filter((go: any) => go.status === 'active');
  const myGroupOrders = groupOrders.filter((go: any) => go.organizerId === isAuthenticated);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900" data-testid="text-group-orders-title">
                    Group Orders
                  </h1>
                  <p className="mt-1 text-sm text-slate-600">
                    Join bulk purchases for better prices and cost savings
                  </p>
                </div>
                <div className="mt-4 lg:mt-0">
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button data-testid="button-create-group-order">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Group Order
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Group Order</DialogTitle>
                      </DialogHeader>
                      <Form {...createForm}>
                        <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                          <FormField
                            control={createForm.control}
                            name="productId"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Product</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-product">
                                      <SelectValue placeholder="Select a product" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {products.map((product: any) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.name} - ₹{product.pricePerUnit}/{product.unit}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={createForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g., Bulk Rice Order" {...field} data-testid="input-title" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={createForm.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description (Optional)</FormLabel>
                                <FormControl>
                                  <Textarea placeholder="Additional details..." {...field} data-testid="textarea-description" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={createForm.control}
                              name="targetQuantity"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Target Quantity</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      data-testid="input-target-quantity"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={createForm.control}
                              name="maxParticipants"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Max Participants</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      {...field}
                                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                                      data-testid="input-max-participants"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={createForm.control}
                              name="regularPricePerUnit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Regular Price/Unit</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                      data-testid="input-regular-price"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={createForm.control}
                              name="groupPricePerUnit"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Group Price/Unit</FormLabel>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      {...field}
                                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                      data-testid="input-group-price"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={createForm.control}
                            name="deadline"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Deadline</FormLabel>
                                <FormControl>
                                  <Input
                                    type="datetime-local"
                                    {...field}
                                    data-testid="input-deadline"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="flex gap-2 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setShowCreateDialog(false)}
                              className="flex-1"
                              data-testid="button-cancel-create"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={createGroupOrderMutation.isPending}
                              className="flex-1"
                              data-testid="button-submit-create"
                            >
                              {createGroupOrderMutation.isPending ? "Creating..." : "Create"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-md flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="ml-5">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500">Active Group Orders</dt>
                        <dd className="text-lg font-medium text-slate-900" data-testid="text-active-group-orders">
                          {activeGroupOrders.length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-success-500/10 rounded-md flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-success-600" />
                      </div>
                    </div>
                    <div className="ml-5">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500">Potential Savings</dt>
                        <dd className="text-lg font-medium text-slate-900" data-testid="text-potential-savings">
                          ₹12,450
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-warning-500/10 rounded-md flex items-center justify-center">
                        <Clock className="h-5 w-5 text-warning-600" />
                      </div>
                    </div>
                    <div className="ml-5">
                      <dl>
                        <dt className="text-sm font-medium text-slate-500">Ending Soon</dt>
                        <dd className="text-lg font-medium text-slate-900" data-testid="text-ending-soon">
                          {activeGroupOrders.filter((go: any) => {
                            const daysLeft = Math.ceil((new Date(go.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                            return daysLeft <= 2;
                          }).length}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Active Group Orders */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Active Group Orders</CardTitle>
                <p className="text-sm text-slate-600">
                  Join these group orders to get better prices through bulk purchasing
                </p>
              </CardHeader>
              <CardContent>
                {groupOrdersLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="mt-2 text-slate-500">Loading group orders...</p>
                  </div>
                ) : activeGroupOrders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-slate-300" />
                    <p>No active group orders</p>
                    <p className="text-sm">Be the first to create a group order</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {activeGroupOrders.map((groupOrder: any) => (
                      <GroupOrderCard
                        key={groupOrder.id}
                        groupOrder={groupOrder}
                        onJoin={handleJoinGroupOrder}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Join Group Order Dialog */}
            <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Join Group Order</DialogTitle>
                </DialogHeader>
                {selectedGroupOrder && (
                  <div className="space-y-4">
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h3 className="font-medium text-slate-900">{selectedGroupOrder.title}</h3>
                      <p className="text-sm text-slate-600 mt-1">
                        Group Price: ₹{selectedGroupOrder.groupPricePerUnit}/unit
                      </p>
                      <p className="text-sm text-slate-600">
                        Regular Price: ₹{selectedGroupOrder.regularPricePerUnit}/unit
                      </p>
                    </div>
                    
                    <Form {...joinForm}>
                      <form onSubmit={joinForm.handleSubmit(onJoinSubmit)} className="space-y-4">
                        <FormField
                          control={joinForm.control}
                          name="quantity"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantity</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                                  data-testid="input-join-quantity"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="bg-success-50 p-3 rounded-lg">
                          <p className="text-sm text-success-800">
                            You'll save: ₹{((selectedGroupOrder.regularPricePerUnit - selectedGroupOrder.groupPricePerUnit) * (joinForm.watch('quantity') || 1)).toFixed(2)}
                          </p>
                        </div>

                        <div className="flex gap-2 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowJoinDialog(false)}
                            className="flex-1"
                            data-testid="button-cancel-join"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            disabled={joinGroupOrderMutation.isPending}
                            className="flex-1"
                            data-testid="button-submit-join"
                          >
                            {joinGroupOrderMutation.isPending ? "Joining..." : "Join Order"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}
