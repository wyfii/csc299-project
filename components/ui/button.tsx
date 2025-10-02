import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-button uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-trench-orange disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-trench-orange text-black hover:bg-orange-500",
        destructive:
          "bg-red-600 text-white hover:bg-red-700",
        outline:
          "border border-gray-800 bg-black text-gray-300 hover:bg-gray-900 hover:text-white",
        secondary:
          "bg-gray-900 text-gray-300 hover:bg-gray-800",
        ghost: "text-gray-300 hover:bg-gray-900 hover:text-white",
        link: "text-trench-orange underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        style={{ clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)' }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
