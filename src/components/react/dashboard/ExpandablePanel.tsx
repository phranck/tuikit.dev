import { useRef, useEffect, type ReactNode } from "react";
import { useEscapeKey } from "../../../hooks/useEscapeKey";

interface ExpandablePanelProps {
  /** Whether the panel is visible/expanded */
  open: boolean;
  /** Title displayed in the top border line */
  title?: string;
  /** Callback when panel requests to close (e.g., ESC key) */
  onClose?: () => void;
  /** Panel content */
  children: ReactNode;
  /** Optional additional CSS classes */
  className?: string;
}

/**
 * A generic expandable panel with smooth height animation.
 *
 * Features:
 * - Top border with centered title
 * - Smooth expand/collapse animation
 * - Bottom border
 * - ESC key to close
 */
export default function ExpandablePanel({
  open,
  title,
  onClose,
  children,
  className = "",
}: ExpandablePanelProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // ESC key handler
  useEscapeKey(onClose, open);

  // Height animation
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const container = containerRef.current;
    if (!wrapper || !container) return;

    if (open) {
      const contentHeight = container.scrollHeight + 24;
      wrapper.style.height = `${contentHeight}px`;
      wrapper.style.opacity = "1";
    } else {
      wrapper.style.height = "0px";
      wrapper.style.opacity = "0";
    }
  }, [open, children]);

  return (
    <div
      ref={wrapperRef}
      className="relative transition-[height,opacity] duration-300 ease-in-out overflow-hidden"
      style={{ height: 0, opacity: 0 }}
    >
      {/* Top border with title */}
      <div className="flex items-center gap-4">
        <div
          className="h-px flex-1 bg-border"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 20%)",
          }}
        />
        {title && <span className="text-sm font-medium text-muted">{title}</span>}
        <div
          className="h-px flex-1 bg-border"
          style={{
            maskImage: "linear-gradient(to left, transparent 0%, black 20%)",
          }}
        />
      </div>

      {/* Content container */}
      <div ref={containerRef} className={`py-4 ${className}`}>
        {children}
      </div>

      {/* Bottom border */}
      <div
        className="h-px bg-border"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)",
        }}
      />
    </div>
  );
}
