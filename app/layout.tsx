import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Evaluator",
  description: "Internal performance-evaluation app for a Cavite State University unit.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
