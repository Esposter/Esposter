// The RAM-backed filesystem seam, mirroring ExecBackend's role for exec. One implementation today (platformatic);
// Core node:vfs swaps in behind it once it needs no flag, which is why the shape is core's: a provider's paths are
// Its own root, and mounting serves them under a mount point the provider picks. See
// `apps/web/content/docs/virrun/execution-backends.md`.
export interface FsProvider {
  // Safe teardown (unmounts if still mounted); always callable.
  dispose: () => void;
  exists: (path: string) => boolean;
  // Recursive.
  mkdir: (path: string) => void;
  // Patch require/import + core fs so in-process code reads the provider's files under the returned mount point,
  // A reserved namespace that never shadows a real path.
  mount: () => string;
  readonly name: string;
  readFile: (path: string) => string;
  unmount: () => void;
  writeFile: (path: string, data: string) => void;
}
