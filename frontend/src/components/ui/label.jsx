import * as React from "react";
import { cn } from "../../lib/utils";

/* Plain <label> rather than @radix-ui/react-label: htmlFor already gives the
   association Radix would add, and this avoids a dependency for one element. */
const Label = React.forwardRef(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)}
    {...props}
  />
));
Label.displayName = "Label";

export { Label };
