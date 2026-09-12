/**
 * data/faqs.js
 *
 * Quick-reference FAQ cards for support agents.
 *
 * Each FAQ has:
 *   - question : the customer-facing question / scenario
 *   - answer   : short, direct answer the agent can read out
 *   - tags     : keywords used by the search system to surface this FAQ
 *   - tip      : (optional) pro-tip or policy note for the agent
 */

export const faqs = [
  {
    id: 'faq-01',
    question: 'How long does a standard refund take?',
    answer:
      'Refunds to the original payment method take 5–7 business days after approval. ' +
      'Store credit is applied instantly.',
    tags: ['refund', 'money', 'payment', 'credit', 'days'],
    tip: 'Always confirm whether the customer prefers store credit (instant) or original method (5–7 days).',
  },
  {
    id: 'faq-02',
    question: 'What is the return window for products?',
    answer:
      '30 days for defective / wrong items (free return pickup). ' +
      '14 days for change-of-mind returns (customer bears return shipping).',
    tags: ['return', 'policy', 'window', 'days', 'exchange'],
    tip: 'Check the order date carefully before quoting the return window.',
  },
  {
    id: 'faq-03',
    question: "My customer's OTP is not arriving — what should I check?",
    answer:
      'First confirm the phone number on file. ' +
      'DND (Do-Not-Disturb) does NOT block transactional OTPs. ' +
      'Resend from admin portal; if still failing, switch to email OTP.',
    tags: ['otp', '2fa', 'sms', 'verification', 'phone', 'two-factor'],
    tip: 'If the customer changed their number recently, the old number may still be on file.',
  },
  {
    id: 'faq-04',
    question: 'Can I cancel an order that has already shipped?',
    answer:
      'No — once shipped, cancellation is not possible. ' +
      'Advise the customer to refuse delivery or return after receipt for a full refund.',
    tags: ['cancel', 'order', 'shipped', 'delivery', 'refund'],
  },
  {
    id: 'faq-05',
    question: 'What counts as a valid identity proof for account recovery?',
    answer:
      'Government-issued photo ID (Aadhaar, Passport, Voter ID, or Driving Licence). ' +
      'Customer must upload via the secure portal: portal.company.com/verify',
    tags: ['identity', 'id', 'account', 'recovery', 'verification', 'locked'],
    tip: 'Never ask the customer to email sensitive documents — always use the secure upload portal.',
  },
  {
    id: 'faq-06',
    question: 'What is our SLA for billing dispute resolution?',
    answer:
      'Current-cycle disputes: resolved within 1–2 business days. ' +
      'Retroactive (previous cycle) disputes: 3–5 business days via the Billing Disputes team.',
    tags: ['billing', 'dispute', 'sla', 'charge', 'time', 'days'],
  },
  {
    id: 'faq-07',
    question: 'How do I check if there is an ongoing service outage?',
    answer:
      'Check the internal Known Issues board (link in agent portal). ' +
      'Customers can also visit status.company.com for real-time updates.',
    tags: ['outage', 'status', 'down', 'technical', 'issue', 'service'],
    tip: 'Always check the Known Issues board BEFORE raising a new bug report.',
  },
  {
    id: 'faq-08',
    question: 'Can I offer a discount as a goodwill gesture?',
    answer:
      'Yes — agents can apply a one-time goodwill discount of up to 10% on the next order. ' +
      'For larger goodwill credits, raise a manager approval ticket.',
    tags: ['discount', 'goodwill', 'gesture', 'compensation', 'offer'],
    tip: 'Document the reason for every goodwill discount in the ticket notes.',
  },
];
