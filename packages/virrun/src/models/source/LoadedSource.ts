export interface LoadedSource {
  // Resolved working directory the backend executes commands in.
  cwd: string;
  // Tears down any materialized state (temp directory for files/git). A no-op for an existing directory.
  dispose: () => Promise<void>;
}
