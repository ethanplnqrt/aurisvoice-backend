// AurisVoice - Credits API Client
// Functions for interacting with the credits and payment system

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string;

// Safety check for API URL
if (!API_URL) {
  console.warn('⚠️ NEXT_PUBLIC_BACKEND_URL is not defined. API calls will fail in production.');
}

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
    if (!API_URL) {
      throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined');
    }

    const response = await fetch(`${API_URL}/api/credits`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Credits API error:', response.status, text);
      throw new Error(`Credits API error (${response.status})`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text().catch(() => '');
      console.error('Credits API returned non-JSON response:', text.substring(0, 200));
      throw new Error('Invalid response format from credits API');
    }

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
export async function createCheckoutSession(plan: 'starter' | 'pro' | 'premium'): Promise<CheckoutResponse> {
  try {
    if (!API_URL) {
      throw new Error('NEXT_PUBLIC_BACKEND_URL is not defined');
    }

    const response = await fetch(`${API_URL}/api/stripe/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ plan }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Checkout API error:', response.status, text);
      throw new Error(`Checkout API error (${response.status})`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text().catch(() => '');
      console.error('Checkout API returned non-JSON response:', text.substring(0, 200));
      throw new Error('Invalid response format from checkout API');
    }

    const data = await response.json();

    // Validate response structure
    if (!data.ok || !data.url) {
      console.error('Invalid checkout response:', data);
      throw new Error('Invalid checkout response from server');
    }

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

