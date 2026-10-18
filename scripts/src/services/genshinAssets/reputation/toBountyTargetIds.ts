import { InvalidOperationError, Operation } from "@esposter/shared";

// The kind each name of a wiki bounty list resolves to: the lowest-id monster the name is, or else the lowest-id one whose
// Name ends in it, a family's first variant, since the dump names a family's members by element. Provisional: the lowest
// Id stands in for the variant a bounty spawns, which the wiki does not name
export const toBountyTargetIds = (
  names: readonly string[],
  monsters: readonly { id: number; name: string }[],
): number[] => {
  const sortedMonsters = monsters.toSorted((firstMonster, secondMonster) => firstMonster.id - secondMonster.id);
  return names.map((name) => {
    const monster =
      sortedMonsters.find((candidate) => candidate.name === name) ??
      sortedMonsters.find((candidate) => candidate.name.endsWith(` ${name}`));
    if (!monster) throw new InvalidOperationError(Operation.Read, name, "is the name of no monster");
    return monster.id;
  });
};
