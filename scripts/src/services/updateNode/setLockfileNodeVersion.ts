import { LOCKFILE_NEXT_ENTRY_KEY, LOCKFILE_ROOT_ENTRY_REGEX } from "#src/services/updateNode/constants";
import { setManifestNodeVersion } from "#src/services/updateNode/setManifestNodeVersion";

/**
 * Rewrite the `engines.node` of an npm lockfile's root entry, `packages[""]`, to `>=${version}`. The root entry is
 * sliced out first so a dependency's own `engines` further down is left as it was.
 */
export const setLockfileNodeVersion = (lockfileJson: string, version: string): string => {
  const rootMatch = LOCKFILE_ROOT_ENTRY_REGEX.exec(lockfileJson);
  if (!rootMatch) return lockfileJson;

  const rootStart = rootMatch.index;
  const nextEntryIndex = lockfileJson.indexOf(LOCKFILE_NEXT_ENTRY_KEY, rootStart + 1);
  const rootEnd = nextEntryIndex === -1 ? lockfileJson.length : nextEntryIndex;
  const root = setManifestNodeVersion(lockfileJson.slice(rootStart, rootEnd), version);
  return lockfileJson.slice(0, rootStart) + root + lockfileJson.slice(rootEnd);
};
