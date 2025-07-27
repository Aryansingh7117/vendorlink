import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, CreditCard, Calendar, CheckCircle, AlertTriangle } from "lucide-react";

export default function CreditScore() {
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
                    <Button className="w-full">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Business
                    </Button>
                    <Button variant="outline" className="w-full">
                      Download Report
                    </Button>
                    <Button variant="ghost" className="w-full">
                      View History
                    </Button>
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