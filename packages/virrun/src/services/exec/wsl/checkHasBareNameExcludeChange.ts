import { checkIsBareNameExclude } from "#src/services/exec/util/checkIsBareNameExclude";
import { getChangedExcludes } from "#src/services/exec/wsl/getChangedExcludes";
// Whether the two exclude sets disagree on a bare name — the one exclude shape a delete list can't target, since it
// Matches that segment at any depth rather than one path. The changed set itself comes from getChangedExcludes, the
// Same derivation diffSourceMirrorManifests turns into deletes, so the two can never disagree on what changed.
export const checkHasBareNameExcludeChange = (previous: readonly string[], current: readonly string[]): boolean =>
  getChangedExcludes(previous, current).some((exclude) => checkIsBareNameExclude(exclude));
