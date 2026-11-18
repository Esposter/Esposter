// A wiki enemy name's monster: resolved only when exactly one monster's English name is the name, and otherwise refused with
// The count of monsters that hold it, so a name held by several monsters, or by none, is never guessed at
export type WikiEnemyNameResolution = { count: number; isResolved: false } | { isResolved: true; monsterId: number };

export const resolveWikiEnemyName = (
  name: string,
  monsters: readonly { id: number; name: string }[],
): WikiEnemyNameResolution => {
  const [monsterId, ...otherMonsterIds] = monsters.filter((monster) => monster.name === name).map(({ id }) => id);
  if (monsterId !== undefined && otherMonsterIds.length === 0) return { isResolved: true, monsterId };
  return { count: monsterId === undefined ? 0 : 1 + otherMonsterIds.length, isResolved: false };
};
