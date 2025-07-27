import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CreditCard, Calendar, CheckCircle, AlertTriangle, Shield, Download, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function CreditScore() {
  const { toast } = useToast();
  const [creditHistory, setCreditHistory] = useState([
    { date: "2024-01-15", score: 750, change: "+25" },
    { date: "2023-12-15", score: 725, change: "+15" },
    { date: "2023-11-15", score: 710, change: "+10" },
  ]);
  const creditData = {
    score: 750,
    maxScore: 850,
    rating: "Excellent",
    lastUpdated: "2024-01-15",
    trend: "up",
    change: 25
  };

  const factors = [
    {
      factor: "Payment History",
      impact: "high",
      score: 95,
      description: "Consistent on-time payments"
    },
    {
      factor: "Order Volume",
      impact: "medium", 
      score: 80,
      description: "Regular order activity"
    },
    {
      factor: "Supplier Relationships",
      impact: "medium",
      score: 85,
      description: "Strong supplier ratings"
    },
    {
      factor: "Account Age",
      impact: "low",
      score: 70,
      description: "Account established 8 months ago"
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-600";
    if (score >= 650) return "text-yellow-600";
    return "text-red-600";
  };

  const getImpactBadge = (impact: string) => {
    const variants = {
      high: "destructive" as const,
      medium: "default" as const,
      low: "secondary" as const
    };
    return <Badge variant={variants[impact as keyof typeof variants]}>{impact.toUpperCase()} IMPACT</Badge>;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900">Credit Score</h1>
              <p className="mt-1 text-sm text-slate-600">
                Your business creditworthiness and payment reliability score
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Credit Score Overview */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Credit Score Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-6">
                      <div className={`text-6xl font-bold ${getScoreColor(creditData.score)}`}>
                        {creditData.score}
                      </div>
                      <div className="text-slate-600 text-sm">out of {creditData.maxScore}</div>
                      <Badge variant="secondary" className="mt-2">{creditData.rating}</Badge>
                    </div>
                    
                    <Progress value={(creditData.score / creditData.maxScore) * 100} className="mb-4" />
                    
                    <div className="flex items-center justify-between text-sm text-slate-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        Last updated: {new Date(creditData.lastUpdated).toLocaleDateString()}
                      </div>
                      <div className="flex items-center text-green-600">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        +{creditData.change} points this month
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full">
                          <Shield className="h-4 w-4 mr-2" />
                          Verify Business
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Business Verification</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="business-name">Business Name</Label>
                            <Input id="business-name" placeholder="Enter your business name" />
                          </div>
                          <div>
                            <Label htmlFor="registration-number">Registration Number</Label>
                            <Input id="registration-number" placeholder="Business registration number" />
                          </div>
                          <div>
                            <Label htmlFor="tax-id">Tax ID</Label>
                            <Input id="tax-id" placeholder="Tax identification number" />
                          </div>
                          <div>
                            <Label htmlFor="documents">Upload Documents</Label>
                            <Input id="documents" type="file" multiple accept=".pdf,.jpg,.png" />
                          </div>
                          <Button className="w-full" onClick={() => {
                            toast({
                              title: "Verification Submitted",
                              description: "Your business verification documents have been submitted for review.",
                            });
                          }}>
                            Submit for Verification
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    
                    <Button variant="outline" className="w-full" onClick={() => {
                      const reportData = {
                        score: 750,
                        factors: factors,
                        history: creditHistory,
                        date: new Date().toLocaleDateString()
                      };
                      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `credit-report-${new Date().toISOString().split('T')[0]}.json`;
                      a.click();
                      URL.revokeObjectURL(url);
                      toast({
                        title: "Report Downloaded",
                        description: "Your credit report has been downloaded successfully.",
                      });
                    }}>
                      <Download className="h-4 w-4 mr-2" />
                      Download Report
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" className="w-full">
                          <Clock className="h-4 w-4 mr-2" />
                          View History
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Credit Score History</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          {creditHistory.map((entry, index) => (
                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                              <div>
                                <p className="font-medium">{entry.date}</p>
                                <p className="text-sm text-gray-600">Score: {entry.score}</p>
                              </div>
                              <div className={`font-bold ${entry.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                                {entry.change}
                              </div>
                            </div>
                          ))}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Credit Factors */}
            <div className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Credit Score Factors</CardTitle>
                  <p className="text-sm text-slate-600">
                    Key factors affecting your credit score
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {factors.map((factor, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{factor.factor}</h4>
                            <div className="flex items-center space-x-2">
                              {getImpactBadge(factor.impact)}
                              <span className="text-lg font-bold">{factor.score}%</span>
                            </div>
                          </div>
                          <Progress value={factor.score} className="mb-1" />
                          <p className="text-sm text-slate-600">{factor.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}