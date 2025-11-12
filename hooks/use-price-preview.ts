"use client";

import { useEffect, useState } from "react";
import { Paddle, PricePreviewParams } from "@paddle/paddle-js";
import { getPaddleJsErrorDetail } from "@/lib/paddle-helpers";

/**
 * Hook to fetch localized prices from Paddle.js
 * Automatically refetches when country or price IDs change
 */
export function usePricePreview(
  paddle: Paddle | undefined,
  priceIds: string[],
  countryCode?: string,
) {
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!paddle || priceIds.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const request: PricePreviewParams = {
      items: priceIds.map((priceId) => ({ priceId, quantity: 1 })),
      ...(countryCode && { address: { countryCode } }),
    };

    paddle
      .PricePreview(request)
      .then((result) => {
        const priceMap = result.data.details.lineItems.reduce(
          (acc, item) => {
            acc[item.price.id] = item.formattedTotals.total;
            return acc;
          },
          {} as Record<string, string>,
        );
        setPrices(priceMap);
        setLoading(false);
      })
      .catch((err: unknown) => {
        console.error("Error when fetching price preview:", err);
        const errorDetail = getPaddleJsErrorDetail(err);
        setError(`[Development Error: Paddle.js Price Preview] ${errorDetail}`);
        setLoading(false);
      });
  }, [paddle, priceIds.join(","), countryCode]);

  return { prices, loading, error };
}
