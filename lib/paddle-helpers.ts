import { Subscription, ApiError } from "@paddle/paddle-node-sdk";
import { CheckoutEventError } from "@paddle/paddle-js";

/**
 * Parse Paddle SDK responses for client-side consumption
 * The SDK returns complex objects that need JSON serialization
 */
export function parseSDKResponse<T>(response: T): T {
  return JSON.parse(JSON.stringify(response));
}

export const ErrorMessage = "Something went wrong, please try again later";

/**
 * Extract error detail from Paddle.js (client-side) error objects
 */
export function getPaddleJsErrorDetail(err: unknown): string {
  const paddleJsError =
    (err as { error?: CheckoutEventError })?.error ||
    (err as CheckoutEventError);
  return (
    paddleJsError?.detail || (err instanceof Error ? err.message : ErrorMessage)
  );
}

/**
 * Extract a user-friendly error message from a Paddle API error
 */
export function getPaddleErrorMessage(error: unknown): string {
  // Check if it's a Paddle ApiError
  if (error instanceof ApiError) {
    return error.detail;
  }

  // Check if it's a standard Error object
  if (error instanceof Error) {
    return error.message;
  }

  // Fallback to generic message
  return ErrorMessage;
}

/**
 * Determine if a subscription is a cardless trial
 * Cardless trials have:
 * - status: 'trialing'
 * - next_billed_at: null
 * - scheduled_change: null
 */
export function isCardlessTrial(subscription: Subscription): boolean {
  return (
    subscription.status === "trialing" &&
    subscription.nextBilledAt === null &&
    subscription.scheduledChange === null
  );
}

/**
 * Get subscription status label and badge variant
 */
export function getSubscriptionStatusLabel(subscription: Subscription): {
  text: string;
  variant: "default" | "secondary" | "outline";
} {
  if (isCardlessTrial(subscription)) {
    return { text: "Trial (cardless)", variant: "default" };
  }
  if (subscription.status === "trialing") {
    return { text: "Trial (with payment method)", variant: "secondary" };
  }
  return { text: subscription.status, variant: "outline" };
}
