import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Personal Dashboard",
  description:
    "A minimalist personal dashboard for Google Calendar, Tasks, Drive and Photos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
