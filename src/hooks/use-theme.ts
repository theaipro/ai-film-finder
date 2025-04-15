
import { useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem("theme") as Theme) || "system"
  );

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove previous class
    root.classList.remove("light", "dark");
    
    // Add new class based on theme
    const resolvedTheme = theme === "system" ? getSystemTheme() : theme;
    root.classList.add(resolvedTheme);
    
    // Save to localStorage
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Watch for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = () => {
      const root = window.document.documentElement;
      const systemTheme = getSystemTheme();
      
      root.classList.remove("light", "dark");
      root.classList.add(systemTheme);
    };
    
    mediaQuery.addEventListener("change", handleChange);
    
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [theme]);

  return { theme, setTheme };
}
