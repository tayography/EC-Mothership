import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 transition-all duration-200 backdrop-blur-xl",
        destructive:
          "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-xl shadow-red-500/30 hover:shadow-2xl hover:shadow-red-500/40 hover:scale-105 transition-all duration-200",
        outline:
          "border border-white/30 bg-white/20 dark:bg-white/5 backdrop-blur-xl shadow-lg hover:bg-white/30 dark:hover:bg-white/10 hover:scale-105 transition-all duration-200",
        secondary:
          "bg-white/40 dark:bg-white/10 backdrop-blur-xl text-secondary-foreground shadow-lg hover:bg-white/50 dark:hover:bg-white/15 hover:scale-105 transition-all duration-200",
        ghost: "hover:bg-white/30 dark:hover:bg-white/10 backdrop-blur-xl hover:scale-105 transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }