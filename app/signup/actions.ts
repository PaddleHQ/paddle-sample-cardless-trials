"use server";

import { getPaddleInstance } from "@/lib/paddle";
import { parseSDKResponse, getPaddleErrorMessage } from "@/lib/paddle-helpers";
import { Transaction, CountryCode } from "@paddle/paddle-node-sdk";

interface CreateTrialParams {
  email: string;
  countryCode: CountryCode;
  postalCode: string;
  priceId: string;
}

interface ActionResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Create a cardless trial subscription
 * This creates a customer, address, and transaction in one flow
 */
export async function createCardlessTrial(
  params: CreateTrialParams,
): Promise<ActionResponse<Transaction>> {
  try {
    const paddle = getPaddleInstance();

    // Step 1: Create customer
    const customer = await paddle.customers.create({
      email: params.email,
    });

    // Step 2: Create address for the customer
    const address = await paddle.addresses.create(customer.id, {
      countryCode: params.countryCode,
      postalCode: params.postalCode,
    });

    // Step 3: Create transaction with cardless trial
    // Status 'billed' means the transaction is finalized and will auto-complete
    const transaction = await paddle.transactions.create({
      items: [{ priceId: params.priceId, quantity: 1 }],
      customerId: customer.id,
      addressId: address.id,
      collectionMode: "automatic",
      status: "billed", // Important: auto-completes the transaction to create a subscription
    });

    return { data: parseSDKResponse(transaction) };
  } catch (error) {
    console.error("Error creating cardless trial:", error);
    return { error: getPaddleErrorMessage(error) };
  }
}

/**
 * Get transaction details
 * Used to poll for transaction completion and extract subscription ID
 * This is only for demo purposes only. In production, listen to the `transaction.completed` webhook instead
 */
export async function getTransaction(
  transactionId: string,
): Promise<ActionResponse<Transaction>> {
  try {
    const paddle = getPaddleInstance();
    const transaction = await paddle.transactions.get(transactionId);
    return { data: parseSDKResponse(transaction) };
  } catch (error) {
    console.error("Error fetching transaction:", error);
    return { error: getPaddleErrorMessage(error) };
  }
}
