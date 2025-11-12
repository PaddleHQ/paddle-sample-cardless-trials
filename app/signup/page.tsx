"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaddleErrorAlert } from "@/components/paddle-error-alert";
import { usePaddle } from "@/hooks/use-paddle";
import { usePricePreview } from "@/hooks/use-price-preview";
import { createCardlessTrial, getTransaction } from "./actions";
import { PRICING_TIERS, SUPPORTED_COUNTRIES } from "@/constants/pricing-tiers";
import { Loader2, AlertCircle } from "lucide-react";
import { DevInfoBox } from "@/components/dev-info-box";
import type { CountryCode } from "@paddle/paddle-node-sdk";

type SignupStatus = "idle" | "creating" | "polling" | "success" | "error";

export default function SignupPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const priceId = searchParams.get("priceId");
  const tierId = searchParams.get("tier");

  const [email, setEmail] = useState("");
  const [countryCode, setCountryCode] = useState<CountryCode>(
    "US" as CountryCode,
  );
  const [postalCode, setPostalCode] = useState("");
  const [status, setStatus] = useState<SignupStatus>("idle");
  const [paddleApiError, setApiError] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  const { paddle, error: paddleJsError } = usePaddle();
  const {
    prices,
    loading: pricesLoading,
    error: priceError,
  } = usePricePreview(paddle, priceId ? [priceId] : [], countryCode);

  const selectedTier = PRICING_TIERS.find((tier) => tier.id === tierId);

  // Poll transaction until completed
  const pollTransactionUntilComplete = async (
    txnId: string,
    attempt = 0,
  ): Promise<string> => {
    if (attempt >= 5) {
      throw new Error("Transaction polling timed out.");
    }

    // Wait 5 seconds before checking
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const result = await getTransaction(txnId);

    if (result.error) {
      throw new Error(result.error);
    }

    if (result.data?.status === "completed" && result.data.subscriptionId) {
      return result.data.subscriptionId;
    }

    // Try again
    return pollTransactionUntilComplete(txnId, attempt + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!priceId) {
      setApiError("No price selected");
      return;
    }

    setStatus("creating");
    setApiError(null);

    try {
      // Step 1: Create the cardless trial
      const result = await createCardlessTrial({
        email,
        countryCode,
        postalCode,
        priceId,
      });

      if (result.error || !result.data) {
        throw new Error(result.error || "Failed to create trial");
      }

      const txnId = result.data.id;
      setTransactionId(txnId);

      // Step 2: Poll for completion
      setStatus("polling");
      const subscriptionId = await pollTransactionUntilComplete(txnId);

      // Step 3: Store and redirect
      localStorage.setItem("subscriptionId", subscriptionId);
      setStatus("success");
      router.push(`/dashboard?sub=${subscriptionId}`);
    } catch (err) {
      console.error("Signup error:", err);
      setApiError(
        err instanceof Error ? err.message : "Failed to create trial",
      );
      setStatus("error");
    }
  };

  const handleRetry = async () => {
    if (!transactionId) return;
    setStatus("polling");
    setApiError(null);

    try {
      const subscriptionId = await pollTransactionUntilComplete(transactionId);
      localStorage.setItem("subscriptionId", subscriptionId);
      setStatus("success");
      router.push(`/dashboard?sub=${subscriptionId}`);
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Failed to create trial",
      );
      setStatus("error");
    }
  };

  if (!priceId || !selectedTier) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Invalid selection</CardTitle>
            <CardDescription>
              Please select a plan from the pricing page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              Back to pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Developer Info */}
        <PaddleErrorAlert
          error={paddleJsError || priceError}
          className="mb-4"
        />
        <DevInfoBox
          title="Create cardless trial"
          description="This page creates a customer and address, then creates a transaction where the status is 'billed'. Because the price has a cardless trial period, the transaction automatically completes, creating a subscription without requiring payment details."
          docsLink="https://developer.paddle.com/build/subscriptions/cardless-trials"
        />

        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-2xl">Start your free trial</CardTitle>
            <CardDescription>
              You've selected the <strong>{selectedTier.name}</strong> plan
              {!pricesLoading && prices[priceId] && (
                <>
                  {" "}
                  at <strong>{prices[priceId]}/month</strong>
                </>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={status !== "idle" && status !== "error"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={countryCode}
                  onValueChange={(value) =>
                    setCountryCode(value as CountryCode)
                  }
                  disabled={status !== "idle" && status !== "error"}
                >
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_COUNTRIES.map((country) => (
                      <SelectItem key={country.code} value={country.code}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">ZIP / Postal Code</Label>
                <Input
                  id="postalCode"
                  type="text"
                  placeholder="12345"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  required
                  disabled={status !== "idle" && status !== "error"}
                />
              </div>

              {paddleApiError && <PaddleErrorAlert error={paddleApiError} />}

              {status === "idle" || status === "error" ? (
                <div className="flex gap-2">
                  {status === "error" && transactionId && (
                    <Button
                      type="button"
                      onClick={handleRetry}
                      className="flex-1"
                    >
                      Retry
                    </Button>
                  )}
                  <Button type="submit" className="flex-1">
                    Start Free Trial
                  </Button>
                </div>
              ) : (
                <Button disabled className="w-full">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {status === "creating" && "Creating your trial..."}
                  {status === "polling" && "Completing setup..."}
                  {status === "success" && "Redirecting..."}
                </Button>
              )}
            </form>

            <p className="text-xs text-muted-foreground mt-4 text-center">
              No credit card required. Your trial starts immediately.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
