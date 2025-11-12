import { Environment, LogLevel, Paddle } from "@paddle/paddle-node-sdk";

/**
 * Get a Paddle SDK instance configured for server-side use
 * Used in server actions and API routes
 */
export function getPaddleInstance() {
  if (!process.env.PADDLE_API_KEY) {
    throw new Error("PADDLE_API_KEY is not set");
  }

  const env = process.env.NEXT_PUBLIC_PADDLE_ENV;

  // For sandbox and production, use the standard SDK
  return new Paddle(process.env.PADDLE_API_KEY, {
    environment: (env as Environment) ?? Environment.sandbox,
    logLevel: LogLevel.error,
  });
}
