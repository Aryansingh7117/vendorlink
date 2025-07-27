import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  ShoppingCart, 
  Users, 
  Search, 
  Star, 
  TrendingUp, 
  CreditCard, 
  Settings,
  Package,
  Clock,
  CheckCircle
} from "lucide-react";

interface SidebarProps {
  userRole?: 'vendor' | 'supplier' | 'both';
}

export default function Sidebar({ userRole = 'vendor' }: SidebarProps) {
  const [location] = useLocation();

  const vendorNavItems = [
    { icon: BarChart3, label: "Overview", href: "/vendor-dashboard" },
    { icon: ShoppingCart, label: "My Orders", href: "/orders" },
    { icon: Users, label: "Group Purchases", href: "/group-orders" },
  ];

  const marketplaceNavItems = [
    { icon: Search, label: "Find Suppliers", href: "/marketplace" },
    { icon: Star, label: "Saved Suppliers", href: "/saved-suppliers" },
    { icon: TrendingUp, label: "Price Tracking", href: "/price-tracking" },
  ];

  const supplierNavItems = [
    { icon: BarChart3, label: "Overview", href: "/supplier-dashboard" },
    { icon: Package, label: "My Products", href: "/supplier-products" },
    { icon: Clock, label: "Pending Orders", href: "/pending-orders" },
    { icon: CheckCircle, label: "Order History", href: "/order-history" },
  ];

  const accountNavItems = [
    { icon: CreditCard, label: "Credit Score", href: "/credit-score" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  const NavSection = ({ title, items }: { title: string; items: typeof vendorNavItems }) => (
    <div>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
        {title}
      </h3>
      <nav className="space-y-1">
        {items.map((item) => (
          <Link key={item.href} href={item.href}>
            <div
              className={cn(
                "group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer",
                location === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
              data-testid={`sidebar-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon 
                className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  location === item.href
                    ? "text-primary"
                    : "text-slate-400 group-hover:text-slate-600"
                )} 
              />
              {item.label}
            </div>
          </Link>
        ))}
      </nav>
    </div>
  );

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-slate-200 hidden lg:block">
      <div className="p-6">
        <div className="space-y-6">
          {userRole === 'supplier' ? (
            <NavSection title="Supplier Dashboard" items={supplierNavItems} />
          ) : (
            <NavSection title="Dashboard" items={vendorNavItems} />
          )}
          
          {userRole !== 'supplier' && (
            <NavSection title="Marketplace" items={marketplaceNavItems} />
          )}
          
          <NavSection title="Account" items={accountNavItems} />
        </div>
      </div>
    </aside>
  );
}
