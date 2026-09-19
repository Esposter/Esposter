import { LOCKFILE } from "#src/services/shared/constants";

// Whether the only thing in the way is the lockfile — the one conflict a merge or a replay of this repository
// almost always brings, and the one nothing has to read to settle (`git` skill)
export const checkIsLockfileOnly = (paths: string[]): boolean => paths.length === 1 && paths[0] === LOCKFILE;
