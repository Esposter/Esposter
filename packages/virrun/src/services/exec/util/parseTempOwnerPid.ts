import { parsePid } from "#src/services/exec/util/parsePid";
// A pid-tagged temp dir name is `<reapPrefix><pid>.<mkdtempRandom>` (see withPidTempPrefix). Given the reap prefixes
// Ordered longest-first (so a `upper.persist.` temp is not shadowed by the shorter `upper.` prefix), strip the matching
// Prefix and read the leading pid. Returns undefined for a published bare name (`upper`/`work`, no trailing `.`), a
// Legacy random-only temp, or any non-temp entry — callers treat undefined as "not a reclaimable temp, leave it".
export const parseTempOwnerPid = (name: string, prefixes: readonly string[]): number | undefined => {
  const matchedPrefix = prefixes.find((prefix) => name.startsWith(prefix));
  if (matchedPrefix === undefined) return undefined;
  return parsePid(name.slice(matchedPrefix.length));
};
