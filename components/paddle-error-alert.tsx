import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface PaddleErrorAlertProps {
  error: string | null;
  className?: string;
}

/**
 * Alert component for displaying Paddle errors
 * Used for both Paddle.js client-side errors (initialization, price preview)
 * and Paddle API server-side errors (subscription, transaction operations)
 */
export function PaddleErrorAlert({ error, className }: PaddleErrorAlertProps) {
  if (!error) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );
}
