// src/hooks/useDarkMode.ts
import { useEffect, useState } from "react";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored === "true") {
      setIsDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.setAttribute("data-theme", "dark");
        localStorage.setItem("darkMode", "true");
      } else {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("darkMode", "false");
      }
      return next;
    });
  };

  return { isDark, toggle };
}