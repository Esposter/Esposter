import { getResult } from "@esposter/shared";
// A probe's trimmed stdout, or undefined when the command is absent or errors (getResult swallows the throw; a
// Missing tool has no partial result to report).
export const readProbeOutput = (read: () => string): string | undefined =>
  getResult(read)
    .map((stdout) => stdout.trim())
    .unwrapOr(undefined);
