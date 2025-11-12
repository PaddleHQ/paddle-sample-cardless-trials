"use client";

import { useEffect, useState } from "react";
import { initializePaddle, Paddle, type Environments } from "@paddle/paddle-js";
import { getPaddleJsErrorDetail } from "@/lib/paddle-helpers";

/**
 * Hook to initialize and manage Paddle.js instance
 * Used for client-side Paddle operations like price preview and checkout
 */
export function usePaddle() {
  const [paddle, setPaddle] = useState<Paddle | undefined>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENV as
      | "sandbox"
      | "production";

    if (!token) {
      console.error("NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set");
      setError(
        "[Development Error: Paddle.js Initialization] NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is not set",
      );
      return;
    }

    initializePaddle({
      token,
      environment: (environment as unknown as Environments) ?? "sandbox",
    })
      .then((paddleInstance) => {
        if (paddleInstance) {
          setPaddle(paddleInstance);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        console.error("Error when initializing Paddle.js:", err);
        const errorDetail = getPaddleJsErrorDetail(err);
        setError(
          `[Development Error: Paddle.js Initialization] ${errorDetail}`,
        );
      });
  }, []);

  return { paddle, error };
}
