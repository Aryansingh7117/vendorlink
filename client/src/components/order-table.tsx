import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Truck, Clock, Star } from "lucide-react";
import type { Order } from "@shared/schema";

interface OrderTableProps {
  orders: (Order & {
    product?: { name: string; unit: string };
    supplier?: { businessName?: string };
  })[];
  onTrackOrder?: (orderId: string) => void;
  onRateSupplier?: (orderId: string) => void;
  onReorder?: (orderId: string) => void;
  onCancelOrder?: (orderId: string) => void;
}

export default function OrderTable({ 
  orders, 
  onTrackOrder, 
  onRateSupplier, 
  onReorder, 
  onCancelOrder 
}: OrderTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { variant: "secondary" as const, icon: CheckCircle, label: "Delivered" },
      in_transit: { variant: "outline" as const, icon: Truck, label: "In Transit" },
      processing: { variant: "outline" as const, icon: Clock, label: "Processing" },
      pending: { variant: "outline" as const, icon: Clock, label: "Pending" },
      cancelled: { variant: "destructive" as const, icon: Clock, label: "Cancelled" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatOrderId = (id: string) => `#VL-${id.slice(-6).toUpperCase()}`;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead data-testid="table-header-order-id">Order ID</TableHead>
            <TableHead data-testid="table-header-product">Product</TableHead>
            <TableHead data-testid="table-header-supplier">Supplier</TableHead>
            <TableHead data-testid="table-header-quantity">Quantity</TableHead>
            <TableHead data-testid="table-header-total">Total</TableHead>
            <TableHead data-testid="table-header-status">Status</TableHead>
            <TableHead data-testid="table-header-actions">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow 
                key={order.id} 
                className="hover:bg-slate-50"
                data-testid={`row-order-${order.id}`}
              >
                <TableCell className="font-medium" data-testid={`text-order-id-${order.id}`}>
                  {formatOrderId(order.id)}
                </TableCell>
                <TableCell data-testid={`text-product-${order.id}`}>
                  {order.product?.name || 'Unknown Product'}
                </TableCell>
                <TableCell data-testid={`text-supplier-${order.id}`}>
                  {order.supplier?.businessName || 'Unknown Supplier'}
                </TableCell>
                <TableCell data-testid={`text-quantity-${order.id}`}>
                  {order.quantity} {order.product?.unit}
                </TableCell>
                <TableCell className="font-medium" data-testid={`text-total-${order.id}`}>
                  ₹{order.totalAmount}
                </TableCell>
                <TableCell data-testid={`status-${order.id}`}>
                  {getStatusBadge(order.status)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    {order.status === 'delivered' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onRateSupplier?.(order.id)}
                        data-testid={`button-rate-${order.id}`}
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Rate
                      </Button>
                    )}
                    {order.status === 'in_transit' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onTrackOrder?.(order.id)}
                        data-testid={`button-track-${order.id}`}
                      >
                        Track
                      </Button>
                    )}
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onCancelOrder?.(order.id)}
                        data-testid={`button-cancel-${order.id}`}
                      >
                        Cancel
                      </Button>
                    )}
                    {order.status === 'delivered' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onReorder?.(order.id)}
                        data-testid={`button-reorder-${order.id}`}
                      >
                        Reorder
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
