// The line `cherry-pick -x` appends — a copy naming its original, the one record of a port a drifted patch id
// Cannot lose (`readCherryShas`)
const PORTED_LINE_REGEX = /^\(cherry picked from commit (?<sha>[0-9a-f]{40})\)$/gmu;

export const getPortedShas = (log: string): Set<string> =>
  new Set(Array.from(log.matchAll(PORTED_LINE_REGEX), ({ groups }) => groups?.sha ?? ""));
