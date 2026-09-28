// A running shell as a page that connects is replayed it: the session it belongs to and its recent output
export interface ShellEntry {
  output: string;
  sessionId: string;
  shellId: string;
}
