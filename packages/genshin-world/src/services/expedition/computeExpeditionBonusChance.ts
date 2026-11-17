import type { ExpeditionBonus } from "#src/models/expedition/ExpeditionBonus";

// The chance of an expedition bonus for a character sent at a level: the chance of the highest level the table names
// That the character has reached, and none below the table's first level
export const computeExpeditionBonusChance = (level: number, bonuses: readonly ExpeditionBonus[]): number =>
  bonuses
    .filter(({ avatarLevel }) => avatarLevel <= level)
    .toSorted((firstBonus, secondBonus) => firstBonus.avatarLevel - secondBonus.avatarLevel)
    .at(-1)?.probability ?? 0;
