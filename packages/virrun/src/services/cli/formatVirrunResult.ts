// End-of-run line pairing with formatVirrunBanner so each run brackets its output with a start + result line.
export const formatVirrunResult = ({
  command,
  durationMs,
  exitCode,
}: {
  command: readonly string[];
  durationMs: number;
  exitCode: number;
}): string => `[virrun] "${command.join(" ")}" exited ${exitCode} in ${durationMs}ms`;
