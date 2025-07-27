import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, Clock } from "lucide-react";
import type { GroupOrder } from "@shared/schema";

interface GroupOrderCardProps {
  groupOrder: GroupOrder & {
    product?: {
      name: string;
      unit: string;
    };
  };
  onJoin?: (groupOrderId: string) => void;
}

export default function GroupOrderCard({ groupOrder, onJoin }: GroupOrderCardProps) {
  const currentParticipants = groupOrder.currentParticipants || 0;
  const maxParticipants = groupOrder.maxParticipants || 10;
  const progress = (currentParticipants / maxParticipants) * 100;
  const daysLeft = Math.ceil((new Date(groupOrder.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
  
  const getProgressColor = () => {
    if (progress >= 70) return "bg-success-500";
    if (progress >= 40) return "bg-warning-500";
    return "bg-primary";
  };

  const getBadgeVariant = () => {
    if (progress >= 70) return "secondary" as const;
    if (progress >= 40) return "outline" as const;
    return "outline" as const;
  };

  return (
    <Card data-testid={`card-group-order-${groupOrder.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base" data-testid={`text-group-order-title-${groupOrder.id}`}>
            {groupOrder.title || `${groupOrder.product?.name} (Group Order)`}
          </CardTitle>
          <Badge variant={getBadgeVariant()}>
            <Users className="w-3 h-3 mr-1" />
            {currentParticipants}/{maxParticipants} vendors
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-slate-600">Current Price:</span>
            <span className="font-medium" data-testid={`text-current-price-${groupOrder.id}`}>
              ₹{groupOrder.regularPricePerUnit}/{groupOrder.product?.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Group Price:</span>
            <span className="font-medium text-success-600" data-testid={`text-group-price-${groupOrder.id}`}>
              ₹{groupOrder.groupPricePerUnit}/{groupOrder.product?.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Deadline:</span>
            <span className="font-medium flex items-center" data-testid={`text-deadline-${groupOrder.id}`}>
              <Clock className="w-3 h-3 mr-1" />
              {daysLeft > 0 ? `${daysLeft} days left` : 'Ending soon'}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-slate-600">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress 
            value={progress} 
            className="h-2"
            data-testid={`progress-group-order-${groupOrder.id}`}
          />
        </div>

        <Button
          onClick={() => onJoin?.(groupOrder.id)}
          disabled={currentParticipants >= maxParticipants || daysLeft <= 0}
          className="w-full"
          variant={progress >= 70 ? "default" : "outline"}
          data-testid={`button-join-group-order-${groupOrder.id}`}
        >
          {currentParticipants >= maxParticipants 
            ? "Group Full" 
            : daysLeft <= 0 
            ? "Expired" 
            : "Join Group Order"}
        </Button>
      </CardContent>
    </Card>
  );
}
