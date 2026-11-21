import type { Metadata } from "next";
import { Theme } from "@astryxdesign/core/theme";
import { themes, defaultThemeSlug } from "../astryx-themes";
import "./globals.css";

export const metadata: Metadata = {
  title: "OpenAI Chatbot",
  description: "Chatbot client built with Next.js and Astryx",
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
          href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600&display=swap"
        />
      </head>
      <body>
        <Theme theme={themes[defaultThemeSlug]}>{children}</Theme>
      </body>
    </html>
  );
}
