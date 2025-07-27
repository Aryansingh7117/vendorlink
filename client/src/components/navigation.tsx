import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Handshake, Bell, ChevronDown, ShoppingBag } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export default function Navigation() {
  const { user } = useAuth() as { user: User | null };
  const { toast } = useToast();
  const [notificationCount, setNotificationCount] = useState(3);
  const [cartCount, setCartCount] = useState(0);

  // Update cart count from localStorage
  useEffect(() => {
    const updateCartCount = () => {
      const savedCart = localStorage.getItem('vendorlink_cart');
      if (savedCart) {
        try {
          const parsedCart = JSON.parse(savedCart);
          setCartCount(parsedCart.length);
        } catch (error) {
          setCartCount(0);
        }
      } else {
        setCartCount(0);
      }
    };

    // Initial load
    updateCartCount();

    // Listen for storage changes
    window.addEventListener('storage', updateCartCount);
    
    // Custom event for same-tab updates
    window.addEventListener('cartUpdated', updateCartCount);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', updateCartCount);
    };
  }, []);

  const handleNotificationClick = () => {
    toast({
      title: "Notifications",
      description: "You have new price alerts and order updates to review.",
    });
    setNotificationCount(0);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex-shrink-0 flex items-center" data-testid="link-home">
              <Handshake className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold text-slate-900">VendorLink</span>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/marketplace" 
                className="text-slate-600 dark:text-slate-300 hover:text-primary font-medium transition-colors"
                data-testid="link-marketplace"
              >
                Marketplace
              </Link>
              <Link 
                href="/group-orders" 
                className="text-slate-600 dark:text-slate-300 hover:text-primary font-medium transition-colors"
                data-testid="link-group-orders"
              >
                Group Orders
              </Link>
              <Link 
                href="/orders" 
                className="text-slate-600 dark:text-slate-300 hover:text-primary font-medium transition-colors"
                data-testid="link-orders"
              >
                My Orders
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={handleNotificationClick}
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => window.location.href = "/cart"}
              className="relative"
              data-testid="button-cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <Badge 
                  variant="default" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-blue-500"
                >
                  {cartCount}
                </Badge>
              )}
            </Button>
            
            <ThemeToggle />
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center space-x-3" data-testid="button-user-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profileImageUrl || undefined} alt="Profile" />
                    <AvatarFallback>
                      {user.firstName?.[0]}{user.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:block text-sm font-medium text-slate-700">
                    {user.firstName} {user.lastName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/vendor-dashboard" data-testid="link-vendor-dashboard">
                      Vendor Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === 'supplier' || user.role === 'both') && (
                    <DropdownMenuItem asChild>
                      <Link href="/supplier-dashboard" data-testid="link-supplier-dashboard">
                        Supplier Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>
                    <a href="/api/logout" className="w-full" data-testid="link-logout">
                      Logout
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
