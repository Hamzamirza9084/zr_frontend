import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-deep-green shadow-[3px_3px_0px_0px_rgba(15,76,58,1)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(15,76,58,1)] active:translate-y-[2px] active:shadow-none border border-deep-green",
        destructive:
          "bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 shadow-sm",
        outline:
          "border-2 border-deep-green bg-white text-deep-green hover:bg-light-green/50 shadow-sm",
        secondary:
          "bg-deep-green text-white border border-deep-green shadow-[3px_3px_0px_0px_rgba(15,76,58,0.3)] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(15,76,58,0.3)]",
        ghost:
          "text-deep-green hover:bg-deep-green/5 hover:text-deep-green",
        link:
          "text-deep-green underline-offset-4 hover:underline hover:text-primary",
        success:
          "bg-[#347928] text-white hover:bg-[#2a6220] shadow-lg hover:shadow-xl hover:-translate-y-0.5",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-xl px-8 text-lg",
        xl: "h-16 rounded-full px-10 text-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
