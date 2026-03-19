import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "HR Document Template Editor",
    description: "Craft.js + Tiptap based template editor",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased min-h-screen bg-neutral-50 text-neutral-900" suppressHydrationWarning>
                {children}
            </body>
        </html>
    );
}
