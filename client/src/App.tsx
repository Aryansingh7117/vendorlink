import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import VendorDashboard from "@/pages/vendor-dashboard";
import SupplierDashboard from "@/pages/supplier-dashboard";
import Marketplace from "@/pages/marketplace";
import GroupOrders from "@/pages/group-orders";
import Orders from "@/pages/orders";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={VendorDashboard} />
          <Route path="/vendor-dashboard" component={VendorDashboard} />
          <Route path="/supplier-dashboard" component={SupplierDashboard} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/group-orders" component={GroupOrders} />
          <Route path="/orders" component={Orders} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
