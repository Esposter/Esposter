import { parsePid } from "#src/services/exec/util/parsePid";

// A pid-tagged temp directory name is `<reapPrefix><pid>.<mkdtempRandom>` (see withPidTempPrefix). Given the reap
// Prefixes ordered longest-first (so a `upper.persist.` temp is not shadowed by the shorter `upper.` prefix), strip the
// Matching prefix and read the leading pid. Returns undefined for a published bare name (`upper`/`work`, no trailing
// `.`), a legacy random-only temp, or any non-temp entry — callers treat undefined as "not a reclaimable temp, leave
// It".
export const parseTempOwnerPid = (name: string, prefixes: readonly string[]): number | undefined => {
  const matchedPrefix = prefixes.find((prefix) => name.startsWith(prefix));
  if (matchedPrefix === undefined) return undefined;
  else return parsePid(name.slice(matchedPrefix.length));
};
