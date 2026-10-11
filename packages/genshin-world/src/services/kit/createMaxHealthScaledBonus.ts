import type { Combatant } from "#src/models/kit/Combatant";

// The flat base damage of a hit priced off its striker's Max HP rather than its ATK, as gcsim's flat damage hits are: the
// Share times the striker's Max HP, given as the hit's additive base damage while its talent multiplier stays zero
export const createMaxHealthScaledBonus =
  (share: number) =>
  ({ attributes }: Combatant): number =>
    share * attributes.maxHealth;
