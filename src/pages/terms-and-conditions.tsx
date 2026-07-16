import { FileText } from 'lucide-react';

const sections = [
  {
    title: 'Orders',
    body:
      'All orders are subject to product availability, delivery coverage, and confirmation by the store team. Pricing and promotions can change without prior notice.',
  },
  {
    title: 'Payments',
    body:
      'Payments may be accepted through cash on delivery, bank transfer, card gateways, or wallet-based methods configured by the business. Orders can remain pending until payment is verified when advance payment is required.',
  },
  {
    title: 'Refunds & Cancellations',
    body:
      'Refund approval depends on order status, payment confirmation, and product condition. If an order has already been prepared or dispatched, a full refund may not be possible.',
  },
  {
    title: 'Chargebacks & Disputes',
    body:
      'Customers should contact support before initiating a chargeback. Delivery logs, order records, payment references, and communication history may be used to resolve disputes.',
  },
  {
    title: 'Delivery Timing',
    body:
      'Estimated timings are guidance only. Weather, traffic, rider availability, and order volume can affect final delivery windows.',
  },
];

export default function TermsAndConditionsPage() {
  return (
    <div className="pb-20">
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 md:px-6 py-14 md:py-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 px-4 py-2 text-xs font-semibold tracking-[0.2em] uppercase">
            <FileText className="w-4 h-4" />
            Terms & Conditions
          </div>
          <h1 className="font-serif text-4xl md:text-6xl font-bold mt-6">
            Order, payment, and delivery terms
          </h1>
          <p className="max-w-3xl text-lg text-primary-foreground/80 mt-4">
            These terms cover how purchases, payments, fulfillment, and disputes are
            handled on the website.
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
