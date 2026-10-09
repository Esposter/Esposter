import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";
import type { Party } from "#src/models/party/Party";

import { healPartyMember } from "#src/services/party/healPartyMember";

// Rolls a hit's party heal, if the hit has one and its striker's character holds a shield, and on a pass heals each
// Member of the party by the flat HP plus the striker's DEF share, each as a share of that member's own Max HP. It
// Returns whether it healed, so a hit with several enemies rolls until one heal passes
export const healKitParty = (
  party: Party,
  characterIdCombatantMap: Map<number, Combatant>,
  effects: readonly KitEffect[],
  striker: Combatant,
  kitHit: KitHit,
  random: () => number,
): boolean => {
  const { healParty } = kitHit;
  if (!healParty || !effects.some((effect) => effect.kind === "shield" && effect.characterId === striker.characterId))
    return false;
  if (random() >= healParty.chance) return false;
  const healedHp = healParty.flatHealth + healParty.defenseShare * striker.attributes.defense;
  for (const characterId of party.characterIdMemberMap.keys()) {
    const member = characterIdCombatantMap.get(characterId);
    if (member) healPartyMember(party, characterId, healedHp / member.attributes.maxHealth);
  }
  return true;
};
