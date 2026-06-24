export interface LoadedSource {
  // Resolved working directory the backend executes commands in.
  cwd: string;
  // Tears down any materialized state (temp dir for files/git). A no-op for an existing dir.
  dispose: () => Promise<void>;
}
