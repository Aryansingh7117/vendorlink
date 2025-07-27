import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Handshake, Users, ShieldCheck, TrendingDown, Globe, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Handshake className="text-primary text-2xl mr-2" />
              <span className="text-xl font-bold text-slate-900">VendorLink</span>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-login"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Connect. Trade. Grow.
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto">
            The comprehensive B2B marketplace platform that brings vendors and suppliers together 
            for smarter procurement, group buying, and trusted business relationships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = '/api/login'}
              data-testid="button-get-started"
            >
              Start Trading Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              data-testid="button-learn-more"
              onClick={() => {
                const featuresSection = document.getElementById('features-section');
                if (featuresSection) {
                  featuresSection.scrollIntoView({ behavior: 'smooth' });
                } else {
                  // Fallback: scroll to features section manually
                  window.scrollTo({ top: 600, behavior: 'smooth' });
                }
              }}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Everything you need for B2B trading
          </h2>
          <p className="text-lg text-slate-600">
            Streamline your procurement process with our comprehensive platform features
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card data-testid="card-marketplace">
            <CardHeader>
              <Globe className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Product Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Discover verified suppliers, compare prices, and find the best deals 
                for your business needs with real-time inventory updates.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-group-buying">
            <CardHeader>
              <Users className="w-8 h-8 text-success-500 mb-2" />
              <CardTitle>Group Buying</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Join forces with other vendors to unlock bulk pricing, reduce costs, 
                and maximize your purchasing power through coordinated orders.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-trust-verification">
            <CardHeader>
              <ShieldCheck className="w-8 h-8 text-warning-500 mb-2" />
              <CardTitle>Trust & Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Build confidence with verified supplier profiles, authentic reviews, 
                and credit scoring based on transaction history.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-price-tracking">
            <CardHeader>
              <TrendingDown className="w-8 h-8 text-error-500 mb-2" />
              <CardTitle>Price Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Stay ahead of market trends with intelligent price alerts and 
                predictive analytics for your key procurement items.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-order-management">
            <CardHeader>
              <Clock className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Track orders in real-time, manage deliveries, and maintain 
                clear communication with suppliers throughout the process.
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-credit-system">
            <CardHeader>
              <Handshake className="w-8 h-8 text-success-500 mb-2" />
              <CardTitle>Credit System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">
                Build your business credit through successful transactions and 
                unlock better terms with trusted suppliers.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to transform your business?
          </h2>
          <p className="text-lg text-primary-100 mb-8">
            Join thousands of vendors and suppliers already trading smarter on VendorLink
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-join-now"
          >
            Join Now - It's Free
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Handshake className="text-primary text-2xl mr-2" />
                <span className="text-xl font-bold">VendorLink</span>
              </div>
              <p className="text-slate-400">
                Connecting businesses for smarter procurement and sustainable growth.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Marketplace</li>
                <li>Group Orders</li>
                <li>Price Tracking</li>
                <li>Analytics</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-slate-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>API Docs</li>
                <li>Status</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-slate-400">
                <li>About</li>
                <li>Privacy</li>
                <li>Terms</li>
                <li>Careers</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 VendorLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
