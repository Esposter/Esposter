// A tool the repository fetches rather than installs: one versioned release asset, the SHA-256 it must have, the
// Folder it is kept in, the glob its executable is found by there, how long its download may take, and whether the
// Asset is an archive the executable is unpacked from or the executable itself
export interface PinnedTool {
  archiveSha256: string;
  archiveUrl: string;
  directory: string;
  downloadTimeoutMs: number;
  executablePattern: string;
  isArchive: boolean;
}
