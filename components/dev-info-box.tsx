import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import Link from "next/link";

interface DevInfoBoxProps {
  title: string;
  description: string;
  docsLink?: string;
}

/**
 * Info box to explain what's happening on each page
 * Helps developers understand what's going on
 */
export function DevInfoBox({ title, description, docsLink }: DevInfoBoxProps) {
  return (
    <Alert className="bg-accent border-border">
      <Info className="h-4 w-4 text-accent-foreground" />
      <AlertDescription className="text-sm text-accent-foreground">
        <strong className="font-semibold">{title}</strong> {description}
        {docsLink && (
          <>
            {" "}
            <Link
              href={docsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline font-medium"
            >
              Learn more →
            </Link>
          </>
        )}
      </AlertDescription>
    </Alert>
  );
}
