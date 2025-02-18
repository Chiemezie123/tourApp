import { loadStripe } from '@stripe/stripe-js';
import { showAlert } from './showAlert';

const stripePromise = loadStripe(
  'pk_test_51QSnXVCDPWbUKHFJed7hk9fQnjkvkXgcGx371QsNxpk9cztC0IqCQRc6QAlp1Qebda9ZfFB37DKTSsqOvUxFqoxT00vXZFJNz9'
);

const testStripe = async () => {
  const stripe = await loadStripe(
    'pk_test_51QSnXVCDPWbUKHFJed7hk9fQnjkvkXgcGx371QsNxpk9cztC0IqCQRc6QAlp1Qebda9ZfFB37DKTSsqOvUxFqoxT00vXZFJNz9'
  );

  if (!stripe) {
    console.log('Stripe failed to load');
  } else {
    console.log('Stripe initialized successfully:', stripe);
  }
};

const redirectToCheckout = async (sessionId) => {
  const stripe = await stripePromise;

  if (!stripe) {
    console.error('Stripe.js not loaded');
    return;
  }

  const { error } = await stripe.redirectToCheckout({
    sessionId: sessionId, // Pass the session ID from your backend
  });

  if (error) {
    console.log('Error redirecting to checkout:', error.message);
  }
};

export const bookingSession = async (api, tourId) => {
  console.log(tourId, 'nothing dey here');
  try {
    const { data } = await api.get(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    const sessionId = data.session.id;
    redirectToCheckout(sessionId);
    showAlert('success', data.status);
  } catch (error) {
    const {message} = error.response.data
    console.log(message, 'wetin sup');
    showAlert('error', message);
  }
};

