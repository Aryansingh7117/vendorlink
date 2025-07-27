import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Star, Send, MessageSquare, Lightbulb, Bug } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Feedback() {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [feedbackType, setFeedbackType] = useState("");
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");

  const handleSubmitFeedback = () => {
    if (!feedbackType || !feedbackTitle || !feedbackMessage) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback! We'll review it and get back to you if needed.",
    });
    
    // Reset form
    setRating(0);
    setFeedbackType("");
    setFeedbackTitle("");
    setFeedbackMessage("");
    setContactEmail("");
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Send Feedback</h1>
              <p className="text-slate-600 dark:text-gray-300 mt-1">Help us improve VendorLink with your suggestions and feedback</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="dark:text-white flex items-center">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Share Your Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Rating Section */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-3">
                    How would you rate your overall experience?
                  </label>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleStarClick(star)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 ${
                            star <= rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300 dark:text-gray-600"
                          }`}
                        />
                      </button>
                    ))}
                    {rating > 0 && (
                      <span className="ml-2 text-sm text-slate-600 dark:text-gray-300">
                        ({rating} star{rating !== 1 ? 's' : ''})
                      </span>
                    )}
                  </div>
                </div>

                {/* Feedback Type */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Feedback Type *
                  </label>
                  <Select value={feedbackType} onValueChange={setFeedbackType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select feedback type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feature-request">
                        <div className="flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Feature Request
                        </div>
                      </SelectItem>
                      <SelectItem value="bug-report">
                        <div className="flex items-center">
                          <Bug className="h-4 w-4 mr-2" />
                          Bug Report
                        </div>
                      </SelectItem>
                      <SelectItem value="general-feedback">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          General Feedback
                        </div>
                      </SelectItem>
                      <SelectItem value="complaint">Complaint</SelectItem>
                      <SelectItem value="compliment">Compliment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Title *
                  </label>
                  <Input
                    value={feedbackTitle}
                    onChange={(e) => setFeedbackTitle(e.target.value)}
                    placeholder="Brief summary of your feedback"
                  />
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Details *
                  </label>
                  <Textarea
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    placeholder="Please provide detailed feedback..."
                    rows={5}
                  />
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 dark:text-white mb-2">
                    Contact Email (Optional)
                  </label>
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="your@email.com (if you want a response)"
                  />
                </div>

                {/* Submit Button */}
                <Button onClick={handleSubmitFeedback} className="w-full" size="lg">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Feedback
                </Button>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="dark:text-white text-lg">Why Your Feedback Matters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-slate-600 dark:text-gray-300">
                  <p>• <strong>Product Improvement:</strong> Your insights help us build better features and fix issues</p>
                  <p>• <strong>User Experience:</strong> We use feedback to make VendorLink more intuitive and efficient</p>
                  <p>• <strong>Community Driven:</strong> Our roadmap is shaped by what our users actually need</p>
                  <p>• <strong>Response Time:</strong> We review all feedback within 48 hours and respond when needed</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}