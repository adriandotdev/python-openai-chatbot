import type { Metadata } from "next";
import { ColorModeProvider } from "./color-mode";
import "./globals.css";

const title = "Flâneur — Paris travel chat";
const description =
  "Flâneur is an AI travel companion for Paris. Ask where to stay, what to eat and how to get around, and plan your whole trip in one conversation.";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://chatbot.adrianmarcelo.dev",
  ),
  title,
  description,
  openGraph: { title, description, type: "website", siteName: "Flâneur" },
  twitter: { card: "summary_large_image", title, description },
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
