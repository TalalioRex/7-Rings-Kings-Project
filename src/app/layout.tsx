import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "7 Rings 7 Kings",
  description: "A Very Suspicious 7-Eleven fake-money slot prototype for the 7 Rings 7 Kings Universe."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
