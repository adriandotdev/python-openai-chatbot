import type { Metadata } from "next";
import { ColorModeProvider } from "./color-mode";
import "./globals.css";

export const metadata: Metadata = {
  title: "Flâneur — Paris travel chat",
  description: "Plan your Paris trip in one conversation.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Instrument+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <ColorModeProvider>{children}</ColorModeProvider>
      </body>
    </html>
  );
}
