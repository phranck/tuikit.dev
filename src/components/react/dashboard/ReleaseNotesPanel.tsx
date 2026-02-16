import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import ExpandablePanel from "./ExpandablePanel";
import type { ReleaseNote } from "../../../hooks/useReleaseNotes";

interface ReleaseNotesPanelProps {
  /** Latest release data */
  release: ReleaseNote | null;
  /** Controls the expand/collapse animation */
  open: boolean;
  /** Callback when panel requests to close */
  onClose?: () => void;
}

/**
 * Release Notes panel showing the latest release details.
 *
 * Displays between the two StatCard rows when the Releases card is clicked.
 * Renders markdown body with GitHub-flavored markdown support.
 */
export default function ReleaseNotesPanel({
  release,
  open,
  onClose,
}: ReleaseNotesPanelProps) {
  // Memoize markdown content to avoid re-parsing on every render
  const markdownContent = useMemo(() => {
    if (!release?.body) return null;

    return (
      <div className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {release.body}
        </ReactMarkdown>
      </div>
    );
  }, [release?.body]);

  if (!release) return null;

  return (
    <ExpandablePanel
      open={open}
      title={`Release ${release.version}`}
      onClose={onClose}
    >
      <div className="mx-auto max-w-4xl px-4">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-foreground">{release.name}</h3>
            <p className="text-sm text-muted">
              Released{" "}
              {new Date(release.publishedAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <a
            href={release.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-accent transition-colors hover:text-foreground"
          >
            View on GitHub →
          </a>
        </div>

        {/* Markdown body */}
        {markdownContent || (
          <p className="text-muted">No release notes available.</p>
        )}
      </div>
    </ExpandablePanel>
  );
}
