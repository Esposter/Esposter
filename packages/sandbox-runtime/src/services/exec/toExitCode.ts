import { constants } from "node:os";

// Translate a child process `close` event into a single exit code. Node emits code=null when the
// Process is terminated by a signal; mirror the shell's 128+signal convention so the result matches
// A native run instead of masking the kill as a success (exit 0).
export const toExitCode = (code: null | number, signal: NodeJS.Signals | null): number =>
  code ?? (signal ? 128 + constants.signals[signal] : 0);
