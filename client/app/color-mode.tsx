"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Theme } from "@astryxdesign/core/theme";
import { themes, defaultThemeSlug } from "../astryx-themes";

type ColorMode = "light" | "dark";

const STORAGE_KEY = "chatbot.theme";

const ColorModeContext = createContext<{
  mode: ColorMode;
  toggle: () => void;
}>({ mode: "light", toggle: () => {} });

export function useColorMode() {
  return useContext(ColorModeContext);
}

export function ColorModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ColorMode>("light");

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {}
    setMode(
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
    );
  }, []);

  const toggle = () => {
    const next: ColorMode = mode === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {}
    setMode(next);
  };

  return (
    <ColorModeContext.Provider value={{ mode, toggle }}>
      <Theme theme={themes[defaultThemeSlug]} mode={mode}>
        {children}
      </Theme>
    </ColorModeContext.Provider>
  );
}
