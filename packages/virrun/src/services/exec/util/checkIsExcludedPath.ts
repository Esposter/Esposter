import { checkIsBareNameExclude } from "#src/services/exec/util/checkIsBareNameExclude";
import { getExcludeRelativePath } from "#src/services/exec/util/getExcludeRelativePath";
// Match a posix relative path against virrun's exclude patterns — the one matcher both sides of the source boundary
// Use, so what never enters the sandbox (the mirror walk, buildSourceMirrorManifest) and what may never leave it (the
// Write-back mask, checkIsUnderSnapshotLower) can't drift apart. Two pattern shapes, mirroring gitignore's own split: a
// Bare name (`node_modules`, `.git`) matches that path segment at any depth, a root-anchored path (`./app`,
// `packages/app/.nuxt`) matches from the tree root — either way the pattern's whole subtree matches, since excluding
// A directory but not its contents is never what a caller means. Which shape a pattern is
// Comes from checkIsBareNameExclude, never re-derived here. Segment-anchored, so a prefix
// Sibling (`.gitignore` vs `.git`, `packages/app-e2e` vs `packages/app`) is never a match.
export const checkIsExcludedPath = (relativePath: string, excludes: readonly string[]): boolean =>
  excludes.some((exclude) => {
    if (checkIsBareNameExclude(exclude))
      return (
        relativePath === exclude ||
        relativePath.startsWith(`${exclude}/`) ||
        relativePath.includes(`/${exclude}/`) ||
        relativePath.endsWith(`/${exclude}`)
      );
    const anchoredPath = getExcludeRelativePath(exclude);
    return relativePath === anchoredPath || relativePath.startsWith(`${anchoredPath}/`);
  });
