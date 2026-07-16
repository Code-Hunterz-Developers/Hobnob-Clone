import { ShieldCheck } from 'lucide-react';

const sections = [
  {
    title: 'Information We Collect',
    body:
      'We collect your name, phone number, delivery address, city, and order notes so we can confirm, prepare, and deliver your order correctly.',
  },
  {
    title: 'Payment Data',
    body:
      'When you pay for an order, we may store payment method references, payment status, and transaction details needed for reconciliation, fraud checks, refunds, and customer support. Sensitive card data should only be processed by approved payment partners.',
  },
  {
    title: 'How We Use Your Data',
    body:
      'Your details are used to fulfill orders, contact you about delivery, resolve complaints, process refunds, and improve the shopping experience across customer and admin panels.',
  },
  {
    title: 'Sharing',
    body:
      'We only share necessary information with delivery riders, payment processors, and operational tools directly involved in your order lifecycle.',
  },
  {
    title: 'Retention',
    body:
      'Order and payment records may be retained for bookkeeping, fraud prevention, and dispute handling, even after a delivery is complete.',
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div className="pb-20">
      <section className="bg-muted/60 border-b border-border">
        <div className="container mx-auto px-4 md:px-6 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-semibold tracking-[0.2em] uppercase">
            <ShieldCheck className="w-4 h-4" />
            Privacy Policy
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mt-6">
            Your order details stay tied to fulfillment, not guesswork
          </h1>
          <p className="max-w-3xl text-lg text-muted-foreground mt-4">
            This page explains how Lavashak Karachi uses customer, delivery, and
            payment-related information.
          </p>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="max-w-4xl space-y-8">
          {sections.map((section) => (
            <article key={section.title} className="rounded-3xl border border-border bg-card p-6 md:p-8">
              <h2 className="font-serif text-2xl md:text-3xl font-bold">{section.title}</h2>
              <p className="mt-3 text-muted-foreground leading-8">{section.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
