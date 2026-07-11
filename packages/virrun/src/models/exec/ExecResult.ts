// The observable outcome of running a command. Correctness is judged by comparing these fields
// Against the same command run natively — see packages/app/content/docs/virrun/correctness.md.
export interface ExecResult {
  exitCode: number;
  // Empty when the command was run with stdio "inherit" (streamed live to the host).
  stderr: string;
  stdout: string;
}
