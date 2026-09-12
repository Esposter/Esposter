// A wsl-backend child's stderr split at the status block it appends after exit: the JSON status bwrap wrote, and
// The real stderr with that block removed.
export interface BwrapStderrStatus {
  status: string;
  stderr: string;
}
