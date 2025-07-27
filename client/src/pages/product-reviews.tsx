import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/navigation";
import Sidebar from "@/components/sidebar";
import { Star, ThumbsUp, MessageSquare, Plus, Package } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const reviewSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  supplierId: z.string().min(1, "Supplier is required"),
  rating: z.number().min(1, "Rating is required").max(5, "Rating cannot exceed 5"),
  comment: z.string().min(10, "Comment must be at least 10 characters"),
});

export default function ProductReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [showReplyDialog, setShowReplyDialog] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  
  const reviewForm = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      productId: "",
      supplierId: "",
      rating: 5,
      comment: "",
    }
  });

  // Sample reviews data
  const [reviews, setReviews] = useState([
    {
      id: "1",
      product: { name: "Premium Basmati Rice", id: "prod-1" },
      supplier: { businessName: "Rice Valley Suppliers", id: "sup-1" },
      vendor: { firstName: "John", lastName: "Doe" },
      rating: 5,
      comment: "Excellent quality rice, perfect for our restaurant. Delivery was on time and packaging was great.",
      helpfulCount: 12,
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      product: { name: "Fresh Red Onions", id: "prod-2" },
      supplier: { businessName: "Farm Fresh Produce", id: "sup-2" },
      vendor: { firstName: "Sarah", lastName: "Chen" },
      rating: 4,
      comment: "Good quality onions, but some were smaller than expected. Overall satisfied with the purchase.",
      helpfulCount: 8,
      createdAt: "2024-01-12"
    },
    {
      id: "3",
      product: { name: "Organic Cooking Oil", id: "prod-3" },
      supplier: { businessName: "Pure Oil Co.", id: "sup-3" },
      vendor: { firstName: "Mike", lastName: "Johnson" },
      rating: 5,
      comment: "Top-notch organic oil. Our customers love the taste and quality. Will definitely reorder.",
      helpfulCount: 15,
      createdAt: "2024-01-10"
    }
  ]);

  const sampleProducts = [
    { id: "prod-1", name: "Premium Basmati Rice", supplier: "Rice Valley Suppliers" },
    { id: "prod-2", name: "Fresh Red Onions", supplier: "Farm Fresh Produce" },
    { id: "prod-3", name: "Organic Cooking Oil", supplier: "Pure Oil Co." },
    { id: "prod-4", name: "Wheat Flour", supplier: "Golden Grains Ltd" },
  ];

  const onSubmitReview = (data: any) => {
    const newReview = {
      id: (reviews.length + 1).toString(),
      product: sampleProducts.find(p => p.id === data.productId) || { name: "Unknown Product", id: data.productId },
      supplier: { businessName: sampleProducts.find(p => p.id === data.productId)?.supplier || "Unknown Supplier", id: data.supplierId },
      vendor: { firstName: "You", lastName: "" },
      rating: data.rating,
      comment: data.comment,
      helpfulCount: 0,
      createdAt: new Date().toLocaleDateString()
    };

    toast({
      title: "Review Submitted!",
      description: "Thank you for sharing your experience. Your review helps other vendors make better decisions.",
    });

    setReviews([newReview, ...reviews]);
    setShowReviewDialog(false);
    reviewForm.reset();
  };

  const handleHelpfulClick = (reviewId: string) => {
    setReviews(reviews.map(review => 
      review.id === reviewId 
        ? { ...review, helpfulCount: review.helpfulCount + 1 }
        : review
    ));
    
    toast({
      title: "Thank you!",
      description: "Your feedback helps other vendors find quality suppliers.",
    });
  };

  const handleReplyClick = (reviewId: string) => {
    setSelectedReviewId(reviewId);
    setShowReplyDialog(true);
  };

  const handleReplySubmit = (replyText: string) => {
    toast({
      title: "Reply Posted!",
      description: "Your reply has been added to the review discussion.",
    });
    
    setShowReplyDialog(false);
    setSelectedReviewId(null);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <Navigation />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 overflow-hidden">
          <div className="p-6 lg:p-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Product Reviews</h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
                    Share your experience and help other vendors find quality suppliers
                  </p>
                </div>
                <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Write Review
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Write Product Review</DialogTitle>
                    </DialogHeader>
                    <Form {...reviewForm}>
                      <form onSubmit={reviewForm.handleSubmit(onSubmitReview)} className="space-y-4">
                        <FormField
                          control={reviewForm.control}
                          name="productId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Product</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select product to review" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {sampleProducts.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.name} - {product.supplier}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={reviewForm.control}
                          name="rating"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Rating</FormLabel>
                              <Select onValueChange={(value) => field.onChange(parseInt(value))} defaultValue={field.value.toString()}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select rating" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {[5, 4, 3, 2, 1].map((rating) => (
                                    <SelectItem key={rating} value={rating.toString()}>
                                      <div className="flex items-center">
                                        {Array.from({ length: rating }, (_, i) => (
                                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                                        ))}
                                        <span className="ml-2">{rating} Star{rating !== 1 ? 's' : ''}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={reviewForm.control}
                          name="comment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Review Comment</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Share your experience with this product and supplier..."
                                  className="min-h-[100px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setShowReviewDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">Submit Review</Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-6">
              {reviews.map((review) => (
                <Card key={review.id} className="dark:bg-gray-800 dark:border-gray-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-slate-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                          <Package className="h-6 w-6 text-slate-400" />
                        </div>
                        <div>
                          <CardTitle className="text-lg dark:text-white">{review.product.name}</CardTitle>
                          <p className="text-sm text-slate-600 dark:text-gray-300 mt-1">
                            Supplied by {review.supplier.businessName}
                          </p>
                          <div className="flex items-center mt-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="ml-2 text-sm font-medium dark:text-gray-300">{review.rating}/5</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-500 dark:text-gray-400">
                          by {review.vendor.firstName} {review.vendor.lastName}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-gray-500 mt-1">
                          {review.createdAt}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 dark:text-gray-300 mb-4">{review.comment}</p>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-gray-600">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                        onClick={() => handleHelpfulClick(review.id)}
                      >
                        <ThumbsUp className="h-4 w-4 mr-1" />
                        Helpful ({review.helpfulCount})
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-slate-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                        onClick={() => handleReplyClick(review.id)}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Call to Action */}
            <Card className="mt-8 text-center dark:bg-gray-800 dark:border-gray-700">
              <CardContent className="py-8">
                <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  Help Fellow Vendors
                </h3>
                <p className="text-slate-600 dark:text-gray-300 mb-4">
                  Your honest reviews help other vendors find reliable suppliers and make better purchasing decisions.
                </p>
                <Button onClick={() => setShowReviewDialog(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Write Your First Review
                </Button>
              </CardContent>
            </Card>

            {/* Reply Dialog */}
            <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Reply to Review</DialogTitle>
                  <DialogDescription>
                    Share your thoughts or ask questions about this review to help the community.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Share your thoughts or ask a question about this review..."
                    className="min-h-[100px]"
                    id="reply-text"
                  />
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowReplyDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => {
                      const replyText = (document.getElementById('reply-text') as HTMLTextAreaElement)?.value;
                      if (replyText?.trim()) {
                        handleReplySubmit(replyText);
                      }
                    }}>
                      Post Reply
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
}