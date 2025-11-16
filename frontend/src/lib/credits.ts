// AurisVoice - Credits API Client
// Functions for interacting with the credits and payment system

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;

export interface CreditsResponse {
  ok: boolean;
  credits: number;
  history?: Array<{
    type: string;
    amount: number;
    date: string;
    description: string;
  }>;
  error?: string;
}

export interface CheckoutResponse {
  ok: boolean;
  sessionId?: string;
  url?: string;
  error?: string;
}

/**
 * Get current credit balance
 */
export async function getCredits(): Promise<CreditsResponse> {
  try {
    const response = await fetch(`${API_URL}/api/credits`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching credits:', error);
    return {
      ok: false,
      credits: 0,
      error: error.message || 'Failed to fetch credits',
    };
  }
}

/**
 * Create a Stripe Checkout session
 * @param plan - Plan ID (starter, pro, premium)
 */
export async function createCheckoutSession(plan: string): Promise<CheckoutResponse> {
  try {
    const response = await fetch(`${API_URL}/api/stripe/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    return {
      ok: false,
      error: error.message || 'Failed to create checkout session',
    };
  }
}

/**
 * Get available pricing plans
 */
export async function getPricingPlans() {
  try {
    const response = await fetch(`${API_URL}/api/plans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error fetching plans:', error);
    return {
      ok: false,
      error: error.message || 'Failed to fetch plans',
    };
  }
}

