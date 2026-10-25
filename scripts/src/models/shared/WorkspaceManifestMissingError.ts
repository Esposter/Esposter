// The error a walk that reaches the file system root throws. It extends Error rather than InvalidOperationError, since the
// Build entry loads the walk before any workspace package can be imported
export class WorkspaceManifestMissingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceManifestMissingError";
  }
}
