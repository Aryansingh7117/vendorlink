import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useState, useEffect } from "react";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import VendorDashboard from "@/pages/vendor-dashboard";
import SupplierDashboard from "@/pages/supplier-dashboard";
import Marketplace from "@/pages/marketplace";
import GroupOrders from "@/pages/group-orders";
import Orders from "@/pages/orders";
import SavedSuppliers from "@/pages/saved-suppliers";
import PriceTracking from "@/pages/price-tracking";
import MyProducts from "@/pages/my-products";
import CreditScore from "@/pages/credit-score";
import Settings from "@/pages/settings";
import Cart from "@/pages/cart";
import SupplierProducts from "@/pages/supplier-products";
import VendorProducts from "@/pages/vendor-products";
import SupplierCatalog from "@/pages/supplier-catalog";
import CustomerSupport from "@/pages/customer-support";
import Feedback from "@/pages/feedback";
import DeliveryTracking from "@/pages/delivery-tracking";
import ProductReviews from "@/pages/product-reviews";

// Loading component with smooth animations
function LoadingScreen() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center animate-fade-in">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">VendorLink</h2>
        <p className="text-gray-500 dark:text-gray-400">Loading your marketplace...</p>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);

  // Simulate page load time to prevent 404 flashing
  useEffect(() => {
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading || pageLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="animate-fade-in">
      <Switch>
        {!isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={VendorDashboard} />
            <Route path="/vendor-dashboard" component={VendorDashboard} />
            <Route path="/supplier-dashboard" component={SupplierDashboard} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/group-orders" component={GroupOrders} />
            <Route path="/orders" component={Orders} />
            <Route path="/saved-suppliers" component={SavedSuppliers} />
            <Route path="/price-tracking" component={PriceTracking} />
            <Route path="/my-products" component={MyProducts} />
            <Route path="/credit-score" component={CreditScore} />
            <Route path="/settings" component={Settings} />
            <Route path="/cart" component={Cart} />
            <Route path="/supplier-products" component={SupplierProducts} />
            <Route path="/vendor-products" component={VendorProducts} />
            <Route path="/supplier-catalog/:supplierId" component={SupplierCatalog} />
            <Route path="/customer-support" component={CustomerSupport} />
            <Route path="/feedback" component={Feedback} />
            <Route path="/delivery-tracking" component={DeliveryTracking} />
            <Route path="/product-reviews" component={ProductReviews} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vendorlink-ui-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
