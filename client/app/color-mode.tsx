"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Button } from "@astryxdesign/core/Button";
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

const svgProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const SunIcon = (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = (
  <svg {...svgProps}>
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
);

/** Icon-only light/dark switch: shows the sun in dark mode, the moon in light. */
export function ColorModeToggle() {
  const { mode, toggle } = useColorMode();
  const next = mode === "dark" ? "light" : "dark";
  return (
    <Button
      label={`Switch to ${next} mode`}
      icon={mode === "dark" ? SunIcon : MoonIcon}
      isIconOnly
      variant="ghost"
      size="sm"
      onClick={toggle}
    />
  );
}
