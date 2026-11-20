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
      <body>
        <Theme theme={themes[defaultThemeSlug]}>{children}</Theme>
      </body>
    </html>
  );
}
