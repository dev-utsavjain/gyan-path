import { apiFetch } from './client';

export interface StudentDetails {
  course_name: string;
  amount: number;
  student_name: string;
  father_name: string;
  age: number;
  mobile: string;
  email: string;
  qualification: string;
  address: string;
  coordinator_name: string;
}

interface RazorpayOrder {
  id: string;
  amount: number; // paise
  currency: string;
}

interface CreateOrderResponse {
  order: RazorpayOrder;
  key_id: string;
}

interface VerifyResponse {
  verified: boolean;
}

// Razorpay checkout callback payload.
export interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const RAZORPAY_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

// Loads the Razorpay Checkout script once and resolves when ready.
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof (window as any).Razorpay !== 'undefined') {
      resolve(true);
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }
    const script = document.createElement('script');
    script.src = RAZORPAY_SCRIPT;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function createOrder(details: StudentDetails): Promise<CreateOrderResponse> {
  return apiFetch<CreateOrderResponse>('/payments/order', { method: 'POST', body: details });
}

export function verifyPayment(payload: RazorpayCheckoutResponse): Promise<VerifyResponse> {
  return apiFetch<VerifyResponse>('/payments/verify', { method: 'POST', body: payload });
}

interface RunCheckoutArgs {
  details: StudentDetails;
  onSuccess: () => void;
  onFailure: (message: string) => void;
  onDismiss: () => void;
}

// Full one-time payment flow: create order -> open Razorpay Checkout ->
// verify the signature on success.
export async function startPayment({ details, onSuccess, onFailure, onDismiss }: RunCheckoutArgs): Promise<void> {
  const ready = await loadRazorpayScript();
  if (!ready) {
    onFailure('Could not load the payment gateway. Please try again.');
    return;
  }

  let order: CreateOrderResponse;
  try {
    order = await createOrder(details);
  } catch (err: any) {
    onFailure(err?.message || 'Could not start the payment.');
    return;
  }

  const options = {
    // Prefer the Razorpay Key ID from .env; fall back to the one from the backend.
    key: (import.meta.env.VITE_RAZORPAY_KEY_ID as string | undefined) || order.key_id,
    order_id: order.order.id,
    amount: order.order.amount,
    currency: order.order.currency,
    name: 'GyaanPath Digital',
    description: details.course_name,
    prefill: {
      name: details.student_name,
      email: details.email,
      contact: details.mobile,
    },
    notes: { course: details.course_name },
    theme: { color: '#F97316' },
    handler: async (response: RazorpayCheckoutResponse) => {
      try {
        const result = await verifyPayment(response);
        if (result.verified) {
          onSuccess();
        } else {
          onFailure('Payment could not be verified. If money was deducted, it will be refunded.');
        }
      } catch (err: any) {
        onFailure(err?.message || 'Payment verification failed.');
      }
    },
    modal: {
      ondismiss: () => onDismiss(),
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.on('payment.failed', (resp: any) => {
    onFailure(resp?.error?.description || 'Payment failed. Please try again.');
  });
  rzp.open();
}
