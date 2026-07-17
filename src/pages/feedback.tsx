import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { MessageSquareHeart } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { sendFeedback } from '@/lib/emailjs';

const feedbackSchema = z.object({
  name: z.string().min(1, 'Please enter your name'),
  email: z.string().email('Please enter a valid email address'),
  message: z.string().min(10, 'Please share a bit more detail (at least 10 characters)'),
});

type FeedbackValues = z.infer<typeof feedbackSchema>;

export default function FeedbackPage() {
  const [submitting, setSubmitting] = React.useState(false);

  const form = useForm<FeedbackValues>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: { name: '', email: '', message: '' },
  });

  const onSubmit = async (values: FeedbackValues) => {
    setSubmitting(true);
    try {
      await sendFeedback(values);
      toast.success('Thanks for your feedback! We\'ll take a look soon.');
      form.reset();
    } catch (err) {
      toast.error('Something went wrong sending your feedback. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-24">
      <PageHero
        title="We'd love to hear from you"
        description="Tell us what you loved, what could be better, or report an issue with your order or the website."
        badge={{ icon: <MessageSquareHeart className="w-4 h-4" />, label: 'Feedback' }}
      />

      <div className="container mx-auto px-4 md:px-6 mt-10 md:mt-14 max-w-2xl">
        <div className="bg-card border border-border rounded-3xl shadow-sm p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} data-testid="input-feedback-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} data-testid="input-feedback-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Share your feedback..."
                        className="min-h-32 resize-none"
                        {...field}
                        data-testid="input-feedback-message"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-full"
                disabled={submitting}
                data-testid="button-feedback-submit"
              >
                {submitting ? 'Sending...' : 'Send Feedback'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
