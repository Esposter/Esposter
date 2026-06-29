// The end-of-run line the CLI prints to stderr once the backend returns: the command that ran, the exit
// Code it propagates, and the wall-clock duration. Pairs with formatVirrunBanner so each `virrun -- <cmd>`
// Brackets its output with a start + result line, making timing and outcome visible in CI logs without a flag.
export const formatVirrunResult = ({
  command,
  durationMs,
  exitCode,
}: {
  command: readonly string[];
  durationMs: number;
  exitCode: number;
}): string => `[virrun] "${command.join(" ")}" exited ${exitCode} in ${durationMs}ms`;
