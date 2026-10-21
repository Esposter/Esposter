export const GIT_FOLDER: string = ".git";
export const NODE_MODULES_FOLDER: string = "node_modules";
// The folder under the git common directory a loaded binary is moved into, so a later removal can delete it once nothing has it loaded
export const WORKTREE_TRASH_FOLDER: string = "worktree-trash";
// The binaries Windows refuses to delete while a process has them loaded, and lets one move
export const LOADED_BINARY_EXTENSIONS: ReadonlySet<string> = new Set([".dll", ".exe", ".node"]);
// Retries a deletion Windows refuses while another process still holds a file in the tree
export const REMOVE_MAX_RETRIES: number = 3;
// Unlinks every junction under the worktree without walking into it: a junction's target is the main checkout's node_modules
export const JUNCTION_UNLINK_COMMAND: string =
  "Get-ChildItem -LiteralPath $env:WORKTREE -Recurse -Force -Attributes ReparsePoint | Where-Object { $_.LinkType -eq 'Junction' } | ForEach-Object { [System.IO.Directory]::Delete($_.FullName) }";
