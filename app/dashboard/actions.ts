"use server";

import { getPaddleInstance } from "@/lib/paddle";
import { parseSDKResponse, getPaddleErrorMessage } from "@/lib/paddle-helpers";
import { Subscription, Transaction } from "@paddle/paddle-node-sdk";

interface ActionResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Get subscription details
 */
export async function getSubscription(
  subscriptionId: string,
): Promise<ActionResponse<Subscription>> {
  try {
    const paddle = getPaddleInstance();
    const subscription = await paddle.subscriptions.get(subscriptionId);
    return { data: parseSDKResponse(subscription) };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return { error: getPaddleErrorMessage(error) };
  }
}

/**
 * Get payment method update transaction
 * This creates a zero-value transaction for collecting payment details.
 * Updates the payment method if one already exists.
 */
export async function getPaymentUpdateTransaction(
  subscriptionId: string,
): Promise<ActionResponse<Transaction>> {
  try {
    const paddle = getPaddleInstance();
    const transaction =
      await paddle.subscriptions.getPaymentMethodChangeTransaction(
        subscriptionId,
      );
    return { data: parseSDKResponse(transaction) };
  } catch (error) {
    console.error("Error getting payment update transaction:", error);
    return { error: getPaddleErrorMessage(error) };
  }
}
