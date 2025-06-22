import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flip A Coin",
  description: "Flip a coin using Chainlink VRF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
