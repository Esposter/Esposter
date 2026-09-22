export interface PnpmOutdatedRun {
  error?: string;
  // Absent when the process never exited on its own — killed on the timeout, or never spawned
  status?: number;
  stderr: string;
  stdout: string;
}
