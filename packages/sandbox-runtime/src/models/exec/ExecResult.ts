// The observable outcome of running a command. Correctness is judged by comparing these fields
// Against the same command run natively — see features/sandbox-runtime/specs/correctness.md.
export interface ExecResult {
  exitCode: number;
  // Empty when the command was run with stdio "inherit" (streamed live to the host).
  stderr: string;
  stdout: string;
}
