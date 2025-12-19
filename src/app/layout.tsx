import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oshi Viewer - Japanese Sword Documentation",
  description: "Visualize Tokubetsu Juyo and Juyo Japanese sword documentation with translations and metadata",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-dark-bg">
        {children}
      </body>
    </html>
  );
}
