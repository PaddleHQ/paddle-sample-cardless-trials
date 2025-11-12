"use client";

import { useState, useEffect } from "react";
import { usePaddle } from "@/hooks/use-paddle";
import { usePricePreview } from "@/hooks/use-price-preview";
import { PRICING_TIERS } from "@/constants/pricing-tiers";
import { PricingCard } from "@/components/pricing-card";
import { DevInfoBox } from "@/components/dev-info-box";
import { PaddleErrorAlert } from "@/components/paddle-error-alert";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  const { paddle, error: paddleJsError } = usePaddle();
  const priceIds = PRICING_TIERS.map((tier) => tier.priceId);
  const {
    prices,
    loading,
    error: priceError,
  } = usePricePreview(paddle, priceIds);
  const [hasSubscription, setHasSubscription] = useState(false);

  const error = paddleJsError || priceError;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setHasSubscription(!!localStorage.getItem("subscriptionId"));
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Developer Info */}
        <div className="max-w-4xl mx-auto mb-8">
          <PaddleErrorAlert error={error} className="mb-6" />
          <DevInfoBox
            title="Pricing page"
            description="This page uses Paddle.js to fetch localized prices for cardless trial products. Prices are localized based on the customer's location. Clicking 'Start Free Trial' redirects to a custom signup page, rather than opening Paddle Checkout."
            docsLink="https://developer.paddle.com/build/subscriptions/cardless-trials"
          />
        </div>

        {/* Existing Subscription Banner */}
        {hasSubscription && (
          <div className="max-w-4xl mx-auto mb-6 text-center">
            <Button asChild variant="secondary">
              <Link href="/dashboard">See existing subscription →</Link>
            </Button>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 text-foreground">
            Cardless trial demo
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start your free 30-day trial — no credit card required. Choose the
            plan that works for you.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {PRICING_TIERS.map((tier) => (
            <PricingCard
              key={tier.id}
              tier={tier}
              price={prices[tier.priceId]}
              loading={loading}
            />
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-muted-foreground mt-12">
          All plans include a 30-day free trial. No credit card required to
          start.
        </p>
      </div>
    </div>
  );
}
