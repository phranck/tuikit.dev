import { useEffect } from "react";

/**
 * Hook to handle ESC key press.
 *
 * @param onEscape - Callback to execute when ESC is pressed
 * @param enabled - Whether the listener is active (default: true)
 */
export function useEscapeKey(onEscape: (() => void) | undefined, enabled = true) {
  useEffect(() => {
    if (!enabled || !onEscape) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onEscape();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onEscape, enabled]);
}
