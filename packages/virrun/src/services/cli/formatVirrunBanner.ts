import type { BackendType } from "@/models/virrun/BackendType";
// Start-of-run line, stderr-only — the programmatic exec path stays silent so correctness diffs that compare child
// Stdout/stderr are untouched. Reports the resolved backend (os sandbox vs native fallback) so an unsupported-host
// Degrade is visible.
export const formatVirrunBanner = ({
  backend,
  command,
  nodeVersion,
}: {
  backend: BackendType;
  command: readonly string[];
  nodeVersion: string;
}): string => `[virrun] running "${command.join(" ")}" (backend=${backend}, node=${nodeVersion})`;
