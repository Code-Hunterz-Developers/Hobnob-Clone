import emailjs from '@emailjs/browser';

const EMAILJS_SERVICE_ID = 'service_ebrh2uc';
const EMAILJS_TEMPLATE_ID = 'template_phltmlc';
const EMAILJS_PUBLIC_KEY = 'bDe2VXqJwnkbhmPKf';

export interface FeedbackPayload {
  name: string;
  email: string;
  message: string;
}

export function sendFeedback({ name, email, message }: FeedbackPayload) {
  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    {
      title: 'Website Feedback',
      name,
      email,
      message,
      time: new Date().toLocaleString(),
    },
    { publicKey: EMAILJS_PUBLIC_KEY }
  );
}
