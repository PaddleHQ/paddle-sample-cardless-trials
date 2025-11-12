"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PaddleErrorAlert } from "@/components/paddle-error-alert";
import { usePaddle } from "@/hooks/use-paddle";
import { getSubscription, getPaymentUpdateTransaction } from "./actions";
import {
  getSubscriptionStatusLabel,
  isCardlessTrial,
} from "@/lib/paddle-helpers";
import {
  Loader2,
  CreditCard,
  AlertCircle,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { Subscription } from "@paddle/paddle-node-sdk";
import { DevInfoBox } from "@/components/dev-info-box";

export default function DashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlSubId = searchParams.get("sub");

  const { paddle, error: paddleJsError } = usePaddle();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [paddleApiError, setApiError] = useState<string | null>(null);
  const [addingPayment, setAddingPayment] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Get subscription ID from URL or localStorage
  const subscriptionId =
    urlSubId ||
    (typeof window !== "undefined"
      ? localStorage.getItem("subscriptionId")
      : null);

  // Reusable function to fetch subscription data (wrapped in useCallback)
  const fetchSubscription = useCallback(
    async (showLoading = true) => {
      if (!subscriptionId) {
        setLoading(false);
        return;
      }

      if (showLoading) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const result = await getSubscription(subscriptionId);

      if (result.error || !result.data) {
        setApiError(result.error || "Failed to load subscription");
        setSubscription(null);
      } else {
        setSubscription(result.data);
        setApiError(null);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [subscriptionId],
  );

  // Initial fetch on mount
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const handleAddPaymentMethod = async () => {
    if (!subscriptionId || !paddle || !paddle.Initialized) return;

    setAddingPayment(true);
    setApiError(null);

    try {
      const result = await getPaymentUpdateTransaction(subscriptionId);

      if (result.error || !result.data) {
        throw new Error(result.error || "Failed to get payment transaction");
      }

      paddle.Checkout.open({
        transactionId: result.data.id,
        settings: {
          variant: "one-page",
        },
      });
    } catch (err) {
      console.error("Error adding payment method:", err);
      setApiError(
        err instanceof Error ? err.message : "Failed to add payment method",
      );
    } finally {
      setAddingPayment(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your subscription...</p>
        </div>
      </div>
    );
  }

  // No subscription found
  if (!subscriptionId || !subscription) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No subscription found</CardTitle>
            <CardDescription>
              You don't have an active subscription yet.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/")} className="w-full">
              View pricing plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusLabel = getSubscriptionStatusLabel(subscription);
  const hasCardlessTrial = isCardlessTrial(subscription);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Paddle.js Errors */}
        <PaddleErrorAlert error={paddleJsError} className="mb-6" />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your subscription and billing
          </p>
        </div>

        {/* Developer Info */}
        <div className="mb-6">
          <DevInfoBox
            title="Collect payment method"
            description="This page shows the subscription status and lets customers add payment details. A subscription is a cardless trial if its status is trialing, it has a next billed date of null, and scheduled change is null. Get a payment method update transaction and pass to Paddle.js to collect payment method."
            docsLink="https://developer.paddle.com/build/subscriptions/cardless-trials"
          />
        </div>

        {/* Main Content Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  Welcome to your account
                </CardTitle>
                <CardDescription className="mt-2">
                  This is a page demonstrating the cardless trial workflow as if
                  someone was logged in
                </CardDescription>
              </div>
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
          </CardHeader>
        </Card>

        {/* Subscription Status Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Subscription status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b">
              <span className="font-medium">Status</span>
              <Badge variant={statusLabel.variant}>{statusLabel.text}</Badge>
            </div>

            <div className="flex items-center justify-between py-3 border-b">
              <span className="font-medium">Subscription ID</span>
              <code className="text-sm bg-muted px-2 py-1 rounded">
                {subscription.id}
              </code>
            </div>

            {subscription.currentBillingPeriod && (
              <div className="flex items-center justify-between py-3 border-b">
                <span className="font-medium">Trial period</span>
                <span className="text-sm">
                  {new Date(
                    subscription.currentBillingPeriod.startsAt,
                  ).toLocaleDateString()}{" "}
                  -{" "}
                  {new Date(
                    subscription.currentBillingPeriod.endsAt,
                  ).toLocaleDateString()}
                </span>
              </div>
            )}

            {subscription.nextBilledAt && (
              <div className="flex items-center justify-between py-3 border-b">
                <span className="font-medium">Next billing date</span>
                <span className="text-sm">
                  {new Date(subscription.nextBilledAt).toLocaleDateString()}
                </span>
              </div>
            )}

            {hasCardlessTrial && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You're currently on a free trial. Add a payment method to
                  ensure uninterrupted access when your trial ends.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Payment Method Section */}
        {hasCardlessTrial && (
          <Card>
            <CardHeader>
              <CardTitle>Payment method</CardTitle>
              <CardDescription>
                Add a payment method to convert your trial to a paid
                subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              {paddleApiError && (
                <PaddleErrorAlert error={paddleApiError} className="mb-4" />
              )}

              <div className="space-y-3">
                <Button
                  onClick={handleAddPaymentMethod}
                  disabled={!paddle?.Initialized || addingPayment}
                  className="w-full"
                >
                  {addingPayment ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Opening checkout...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Add payment method
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => fetchSubscription(false)}
                  disabled={refreshing}
                  variant="outline"
                  className="w-full"
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh status
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                You won't be charged until your trial period ends. Click
                "Refresh status" after adding payment details.
              </p>
            </CardContent>
          </Card>
        )}

        {!hasCardlessTrial && subscription.status === "trialing" && (
          <Card>
            <CardHeader>
              <CardTitle>Payment method added</CardTitle>
              <CardDescription>
                Your payment method has been successfully added
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You'll be automatically charged when your trial period ends.
                  Enjoy your trial!
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Back to Home */}
        <div className="mt-8 text-center">
          <Button variant="secondary" onClick={() => router.push("/")}>
            Back to pricing
          </Button>
        </div>
      </div>
    </div>
  );
}
