'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, MessageSquarePlus, Loader2, MapPin } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirebase, addDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp } from 'firebase/firestore';

const testimonialSchema = z.object({
  author: z.string().min(2, { message: 'Full name is required.' }),
  location: z.string().min(2, { message: 'City and State are required (e.g. Seattle, WA).' }),
  text: z.string().min(10, { message: 'Your review must be at least 10 characters long.' }),
  rating: z.number().min(1).max(5),
});

export function TestimonialForm() {
  const { toast } = useToast();
  const { firestore } = useFirebase();
  const [rating, setRating] = React.useState(5);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<z.infer<typeof testimonialSchema>>({
    resolver: zodResolver(testimonialSchema),
    defaultValues: {
      author: '',
      location: '',
      text: '',
      rating: 5,
    },
  });

  const onSubmit = async (values: z.infer<typeof testimonialSchema>) => {
    if (!firestore) return;

    setIsSubmitting(true);
    try {
      const testimonialsRef = collection(firestore, 'allTestimonials');
      const payload = {
        ...values,
        rating,
        status: 'pending',
        date: serverTimestamp(),
      };

      await addDocumentNonBlocking(testimonialsRef, payload);

      toast({
        title: 'Review Received!',
        description: 'Thank you! Your review has been submitted for moderation.',
      });
      form.reset();
      setRating(5);
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      // Error is handled globally by FirebaseErrorListener
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto max-w-2xl border-primary/20 bg-primary/5 shadow-inner">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary font-bold">
          <MessageSquarePlus className="h-6 w-6 text-accent" />
          Share Your Experience
        </CardTitle>
        <CardDescription className="text-foreground/80 font-bold">
          Your feedback means everything to me. Share how my art, photography, or story has touched you!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="author"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Sarah Jenkins" {...field} className="bg-background" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold">Location</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input placeholder="Seattle, WA" {...field} className="pl-10 bg-background" />
                      </div>
                    </FormControl>
                    <FormDescription className="text-[10px] font-bold">City, State</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <FormLabel className="font-bold">Your Rating</FormLabel>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating ? 'fill-accent text-accent' : 'text-muted-foreground'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <FormField
              control={form.control}
              name="text"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold">Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share details about your build experience, material quality, or the team..."
                      className="min-h-[140px] bg-background"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-bold bg-accent text-accent-foreground hover:bg-accent/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Testimonial'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
