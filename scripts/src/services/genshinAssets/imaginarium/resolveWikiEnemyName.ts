// A wiki enemy name's codex entry: resolved only when every monster whose English name is the name shares one describe
// Id, the entry the game files its monsters under. Otherwise the name is refused with the count of entries that hold
// It, so a name whose monsters span several entries, or that no monster holds, is never guessed at
export type WikiEnemyNameResolution = { count: number; isResolved: false } | { describeId: number; isResolved: true };

export const resolveWikiEnemyName = (
  name: string,
  monsters: readonly { describeId: number; id: number; name: string }[],
): WikiEnemyNameResolution => {
  const describeIds = [
    ...new Set(monsters.filter((monster) => monster.name === name).map(({ describeId }) => describeId)),
  ];
  const [describeId, ...otherDescribeIds] = describeIds;
  if (describeId !== undefined && otherDescribeIds.length === 0) return { describeId, isResolved: true };
  else return { count: describeIds.length, isResolved: false };
};
