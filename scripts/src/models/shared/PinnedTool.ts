// A tool the repository fetches rather than installs: one versioned release asset, the SHA-256 it must have, how long
// Its download may take, the glob its executable is found by in the release's folder, whether the asset is an archive
// The executable is unpacked from or the executable itself, and the tool's own folder, under which each release is kept
export interface PinnedTool {
  archiveSha256: string;
  archiveUrl: string;
  downloadTimeoutMs: number;
  executablePattern: string;
  isArchive: boolean;
  toolDirectory: string;
}
