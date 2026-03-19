import * as React from "react";
import { cn } from "../../lib/utils";
import Link from "next/link";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "secondary";
    size?: "default" | "sm" | "lg" | "icon";
    asChild?: boolean;
    href?: string;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", asChild, children, href, ...props }, ref) => {
        const baseClasses = cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            {
                "bg-primary text-primary-foreground hover:bg-primary/90": variant === "default",
                "border border-input bg-background hover:bg-accent hover:text-accent-foreground": variant === "outline",
                "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
                "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
            },
            {
                "h-10 px-4 py-2 text-sm": size === "default",
                "h-9 rounded-md px-3 text-sm": size === "sm",
                "h-11 rounded-md px-8": size === "lg",
                "h-10 w-10": size === "icon",
            },
            className,
        );

        // If asChild is true and an href is provided, render as a link wrapper
        if (asChild && href) {
            return (
                <Link href={href} className={baseClasses}>
                    {children}
                </Link>
            );
        }

        // If asChild, render children as-is but clone with classes
        if (asChild) {
            const child = React.Children.only(children) as React.ReactElement;
            return React.cloneElement(child, {
                className: cn(baseClasses, (child.props as { className?: string }).className),
            });
        }

        return (
            <button ref={ref} className={baseClasses} {...props}>
                {children}
            </button>
        );
    },
);
Button.displayName = "Button";

export { Button };
