import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, CheckCircle, Clock, MapPin } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product & {
    supplier?: {
      businessName?: string;
      isVerified?: boolean;
      rating?: number;
      reviewCount?: number;
    };
    distance?: number;
  };
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const rating = product.supplier?.rating || 4.5;
  const reviewCount = product.supplier?.reviewCount || 50;
  const distance = product.distance || 5.2;

  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`card-product-${product.id}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <img
              src={product.imageUrl || "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&h=200&fit=crop"}
              alt={product.name}
              className="w-16 h-16 rounded-lg object-cover"
              data-testid={`img-product-${product.id}`}
            />
            <div>
              <h4 className="font-medium text-slate-900" data-testid={`text-product-name-${product.id}`}>
                {product.name}
              </h4>
              <p className="text-sm text-slate-600" data-testid={`text-supplier-name-${product.id}`}>
                {product.supplier?.businessName || "Unknown Supplier"}
              </p>
              <div className="flex items-center mt-1">
                <div className="flex text-warning-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-current' : ''}`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-xs text-slate-500" data-testid={`text-rating-${product.id}`}>
                  {rating.toFixed(1)} ({reviewCount} reviews)
                </span>
                {product.supplier?.isVerified && (
                  <Badge variant="secondary" className="ml-3">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-slate-900" data-testid={`text-price-${product.id}`}>
              ₹{product.pricePerUnit}/{product.unit}
            </p>
            <div className="flex items-center text-sm text-slate-500 mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              <span data-testid={`text-distance-${product.id}`}>{distance} km away</span>
            </div>
            <div className="mt-1">
              {product.availableQuantity > 0 ? (
                <p className="text-xs text-success-600" data-testid={`text-stock-${product.id}`}>
                  {product.availableQuantity} {product.unit} available
                </p>
              ) : (
                <p className="text-xs text-error-600">Out of stock</p>
              )}
            </div>
          </div>
          <div className="ml-4">
            <Button
              onClick={() => {
                onAddToCart?.(product);
                // Show immediate visual feedback
                const button = document.activeElement as HTMLButtonElement;
                if (button) {
                  const originalText = button.textContent;
                  button.textContent = "Added!";
                  button.disabled = true;
                  setTimeout(() => {
                    button.textContent = originalText;
                    button.disabled = false;
                  }, 1500);
                }
              }}
              disabled={product.availableQuantity === 0}
              data-testid={`button-add-to-cart-${product.id}`}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
