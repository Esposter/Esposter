import type { BackendType } from "@/models/virrun/BackendType";
// The start-of-run line the CLI prints to stderr before handing off to the backend, so a `virrun -- <cmd>`
// Invocation is self-describing in a terminal or CI log: which command is running, which backend actually
// Resolved (os sandbox vs the native fallback on an unsupported host), and the node version it runs under.
// Stderr-only and CLI-only — the programmatic exec path stays silent so correctness diffs (which compare
// Child stdout/stderr) are untouched.
export const formatVirrunBanner = ({
  backend,
  command,
  nodeVersion,
}: {
  backend: BackendType;
  command: readonly string[];
  nodeVersion: string;
}): string => `[virrun] running "${command.join(" ")}" (backend=${backend}, node=${nodeVersion})`;
