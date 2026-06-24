// The RAM-backed filesystem seam, mirroring ExecBackend's role for exec. The `vfs` exec backend
// Runs JS in-process against one of these so the module loader and core fs see virtual files. One
// Implementation today (platformatic); node:vfs swaps in behind it later. See
// Features/virrun/specs/virtual-fs.md.
export interface FsProvider {
  // Safe teardown (unmounts if still mounted); always callable.
  dispose: () => void;
  exists: (path: string) => boolean;
  // Recursive.
  mkdir: (path: string) => void;
  // Patch require/import + core fs so in-process code reads virtual files under this prefix.
  mount: (prefix: string) => void;
  readonly name: string;
  readFile: (path: string) => string;
  unmount: () => void;
  writeFile: (path: string, data: string) => void;
}
