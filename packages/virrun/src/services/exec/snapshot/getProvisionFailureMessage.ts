import type { ExecOptions } from "@/models/exec/ExecOptions";
import type { ExecResult } from "@/models/exec/ExecResult";
// The detail a failed provisioning command throws with. Provisioning always pipes, so a piped caller's stdout is
// Never poisoned by setup logs — but an interactive caller gets that same stream teed live to stderr as it runs, and
// The tee'd copy is the one they already read. Repeating the retained `stderr` here would print the whole install log
// A second time and bury the line that failed, so the message keeps to the exit code whenever the output was teed.
export const getProvisionFailureMessage = (
  label: string,
  { exitCode, stderr }: ExecResult,
  { tee }: ExecOptions,
): string => `${label} exited with ${exitCode}:${tee ? "" : ` ${stderr}`}`;
