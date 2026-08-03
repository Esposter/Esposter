// Match a posix relative path against virrun's exclude patterns — the one matcher both sides of the source boundary
// Use, so what never enters the sandbox (the mirror walk, buildSourceMirrorManifest) and what may never leave it (the
// Write-back mask, isUnderSnapshotLower) can't drift apart. Two pattern shapes, mirroring gitignore's own split: a
// Bare name (`node_modules`, `.git`) matches that path segment at any depth, a slashed pattern
// (`.claude/worktrees`, `packages/app/.nuxt`) matches from the tree root — either way the pattern's whole subtree
// Matches, since excluding a directory but not its contents is never what a caller means. Segment-anchored, so a
// Prefix sibling (`.gitignore` vs `.git`, `packages/app-e2e` vs `packages/app`) is never a match.
export const isExcludedPath = (relativePath: string, excludes: readonly string[]): boolean =>
  excludes.some(
    (exclude) =>
      relativePath === exclude ||
      relativePath.startsWith(`${exclude}/`) ||
      (!exclude.includes("/") && relativePath.includes(`/${exclude}/`)) ||
      (!exclude.includes("/") && relativePath.endsWith(`/${exclude}`)),
  );
