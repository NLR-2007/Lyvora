import * as React from "react";
import { cn } from "../../lib/utils";

/* Colours come from the theme tokens rather than a fixed zinc ramp, so the
   field follows light and dark like the rest of the app. */
const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground",
      "placeholder:text-muted-foreground/70 transition-colors",
      "focus-visible:border-ring focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/20",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
