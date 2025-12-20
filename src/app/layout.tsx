import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Oshi Viewer - Japanese Sword Documentation",
  description: "Visualize Tokubetsu Juyo and Juyo Japanese sword documentation with translations and metadata",
};

export const viewport: Viewport = {
  themeColor: "#0d0c0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Enable View Transitions API */}
        <meta name="view-transition" content="same-origin" />
      </head>
      <body className="antialiased min-h-screen bg-dark-bg">
        {children}
      </body>
    </html>
  );
}
