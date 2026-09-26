import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/20 text-deep-green",
        secondary:
          "border-transparent bg-deep-green/10 text-deep-green",
        destructive:
          "border-red-200 bg-red-100 text-red-800",
        outline:
          "border-deep-green/20 text-deep-green",
        success:
          "border-green-200 bg-green-100 text-green-800",
        warning:
          "border-yellow-200 bg-yellow-100 text-yellow-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
