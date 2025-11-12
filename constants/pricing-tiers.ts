export interface PricingTier {
  id: string;
  name: string;
  description: string;
  priceId: string;
  features: string[];
  featured: boolean;
}

/**
 * Pricing tiers configuration
 * Update the priceId values with your actual Paddle price IDs
 * These prices should have a cardless trial period configured
 */
export const PRICING_TIERS: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individuals getting started",
    priceId: "pri_01k6g5yr8e6pkj8vct1f5q7j6x", // Replace with your price ID
    features: [
      "30-day free trial",
      "Up to 5 users",
      "Basic features",
      "Email support",
    ],
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For growing teams that need more power",
    priceId: "pri_01k5c14mgh9dc3wgk3vb23p0t7", // Replace with your price ID
    features: [
      "30-day free trial",
      "Up to 25 users",
      "Advanced features",
      "Priority support",
      "API access",
    ],
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "For large organizations with custom needs",
    priceId: "pri_01k6g5zwtm608ggme23bnhn3k7", // Replace with your price ID
    features: [
      "30-day free trial",
      "Unlimited users",
      "All features",
      "Dedicated support",
      "Custom integrations",
      "SLA guarantee",
    ],
    featured: false,
  },
];

/**
 * Supported countries for the signup form
 */
export const SUPPORTED_COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "ES", name: "Spain" },
  { code: "IT", name: "Italy" },
  { code: "NL", name: "Netherlands" },
  { code: "SE", name: "Sweden" },
];
