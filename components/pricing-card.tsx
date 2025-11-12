"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PricingTier } from "@/constants/pricing-tiers";
import { Check } from "lucide-react";
import Link from "next/link";

interface PricingCardProps {
  tier: PricingTier;
  price?: string;
  loading?: boolean;
}

export function PricingCard({ tier, price, loading }: PricingCardProps) {
  return (
    <Card
      className={`flex flex-col ${tier.featured ? "border-primary shadow-lg" : ""}`}
    >
      <CardHeader>
        {tier.featured && (
          <Badge className="w-fit mb-2" variant="default">
            Most popular
          </Badge>
        )}
        <CardTitle className="text-2xl">{tier.name}</CardTitle>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 flex-1">
        <div className="text-4xl font-bold">
          {loading ? (
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          ) : (
            <span>{price || "$--"}</span>
          )}
          <span className="text-lg font-normal text-muted-foreground">
            /month
          </span>
        </div>
        <ul className="space-y-3">
          {tier.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button
          asChild
          className="w-full"
          variant={tier.featured ? "default" : "outline"}
        >
          <Link href={`/signup?priceId=${tier.priceId}&tier=${tier.id}`}>
            Start free trial
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
