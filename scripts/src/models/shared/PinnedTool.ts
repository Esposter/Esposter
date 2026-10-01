// A tool the repository fetches rather than installs: one versioned release archive, the SHA-256 it must have, the
// Folder it is unpacked into, the glob its executable is found by there, and how long its download may take
export interface PinnedTool {
  archiveSha256: string;
  archiveUrl: string;
  directory: string;
  downloadTimeoutMs: number;
  executablePattern: string;
}
