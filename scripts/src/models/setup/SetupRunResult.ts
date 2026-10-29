// How a process ended and what it printed. A null status is a process that never ran, or was killed before it ended; a
// null output is one whose output was shown on the terminal rather than read
export interface SetupRunResult {
  status: number | null;
  stdout: string | null;
}
