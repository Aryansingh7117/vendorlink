import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone, Mail, Clock, CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function CustomerSupport() {
  const { toast } = useToast();
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketMessage, setTicketMessage] = useState("");
  const [tickets] = useState([
    {
      id: "T-001",
      subject: "Order delivery delay",
      status: "resolved",
      priority: "medium",
      createdAt: "2024-01-15",
      lastUpdated: "2024-01-16"
    },
    {
      id: "T-002", 
      subject: "Payment processing issue",
      status: "in-progress",
      priority: "high",
      createdAt: "2024-01-20",
      lastUpdated: "2024-01-21"
    }
  ]);

  const handleSubmitTicket = () => {
    if (!ticketSubject || !ticketMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in both subject and message fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Support Ticket Created",
      description: "Your ticket has been submitted. We'll respond within 24 hours.",
    });
    
    setTicketSubject("");
    setTicketMessage("");
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      resolved: "default",
      "in-progress": "secondary", 
      open: "destructive"
    };
    const colors = {
      resolved: "text-green-600",
      "in-progress": "text-yellow-600",
      open: "text-red-600"
    };
    return (
      <Badge variant={variants[status as keyof typeof variants]} className={colors[status as keyof typeof colors]}>
        {status.replace("-", " ").toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customer Support</h1>
              <p className="text-slate-600 dark:text-gray-300 mt-1">Get help with your VendorLink experience</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Contact Methods */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="dark:text-white">Contact Us</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Live Chat</p>
                        <p className="text-sm text-slate-600 dark:text-gray-300">Available 24/7</p>
                      </div>
                      <Button size="sm" className="ml-auto">Start Chat</Button>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Phone className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Phone Support</p>
                        <p className="text-sm text-slate-600 dark:text-gray-300">+1 (555) 123-4567</p>
                      </div>
                      <Button size="sm" variant="outline" className="ml-auto">Call Now</Button>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Mail className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">Email Support</p>
                        <p className="text-sm text-slate-600 dark:text-gray-300">support@vendorlink.com</p>
                      </div>
                      <Button size="sm" variant="outline" className="ml-auto" onClick={() => {
                        window.open('mailto:support@vendorlink.com?subject=VendorLink Support Request', '_blank');
                      }}>Send Email</Button>
                    </div>
                  </CardContent>
                </Card>

                {/* FAQ Section */}
                <Card>
                  <CardHeader>
                    <CardTitle className="dark:text-white flex items-center">
                      <HelpCircle className="h-5 w-5 mr-2" />
                      Frequently Asked Questions
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                      <h4 className="font-medium text-slate-900 dark:text-white">How do I track my orders?</h4>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Visit the Orders page to view real-time tracking information for all your purchases.</p>
                    </div>
                    <div className="border-b border-gray-200 dark:border-gray-700 pb-3">
                      <h4 className="font-medium text-slate-900 dark:text-white">How do group orders work?</h4>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">Join existing group orders or create your own to get bulk discounts from suppliers.</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900 dark:text-white">What payment methods are accepted?</h4>
                      <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">We accept all major credit cards, bank transfers, and digital wallets.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Support Ticket Form & History */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="dark:text-white">Create Support Ticket</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Subject</label>
                      <Input
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="Brief description of your issue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">Message</label>
                      <Textarea
                        value={ticketMessage}
                        onChange={(e) => setTicketMessage(e.target.value)}
                        placeholder="Describe your issue in detail..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleSubmitTicket} className="w-full">
                      Submit Ticket
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="dark:text-white">Your Support Tickets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tickets.map((ticket) => (
                        <div key={ticket.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-slate-900 dark:text-white">{ticket.subject}</h4>
                            {getStatusBadge(ticket.status)}
                          </div>
                          <div className="flex items-center text-sm text-slate-600 dark:text-gray-300 space-x-4">
                            <span>#{ticket.id}</span>
                            <span>Created: {ticket.createdAt}</span>
                            <span>Updated: {ticket.lastUpdated}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}