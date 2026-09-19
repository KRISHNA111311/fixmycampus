import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "FixMyCampus", description: "See It. Report It. Track It. Get It Fixed." };
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-full antialiased">
        <main className="mx-auto max-w-screen-sm px-4 pb-24 pt-6 md:max-w-2xl lg:max-w-4xl">{children}</main>
      </body>
    </html>
  );
}