import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";

// The source a disorder's bonus is given under, so the leave ends the disorders' bonuses and no other buff
export const DOMAIN_DISORDER_SOURCE = "domainDisorder";

// The ley line disorders the fight models: each a constant bonus on every member of the team, as the game's description of
// The disorder says (PROVISIONAL: the disorders that trigger on reactions, HP changes or Nightsoul points need their events,
// Which the kits' outbox does not carry for them, so those change nothing yet)
const DISORDER_BONUSES: Readonly<Record<string, { amount: number; attribute: Attribute }>> = {
  LevelEntity_Avatar_CriticalUp: { amount: 0.5, attribute: Attribute.CriticalRate },
  LevelEntity_ElementAddHurt_Electric: { amount: 0.75, attribute: Attribute.ElectroDamageBonus },
  LevelEntity_ElementAddHurt_Fire: { amount: 0.75, attribute: Attribute.PyroDamageBonus },
  LevelEntity_ElementAddHurt_Ice: { amount: 0.75, attribute: Attribute.CryoDamageBonus },
  LevelEntity_ElementAddHurt_Rock: { amount: 0.75, attribute: Attribute.GeoDamageBonus },
  LevelEntity_ElementAddHurt_Water: { amount: 0.75, attribute: Attribute.HydroDamageBonus },
  LevelEntity_PhysicalAddHurt: { amount: 0.75, attribute: Attribute.PhysicalDamageBonus },
};

// Gives every member of the deployed team the bonus its level's disorder names, for the seconds the challenge is given
export const applyDomainDisorder = (
  kitEffectState: KitEffectState,
  party: Party,
  disorder: string,
  seconds: number,
): void => {
  const bonus = DISORDER_BONUSES[disorder];
  if (bonus)
    buffKitTeam(kitEffectState, party, {
      ...bonus,
      secondsRemaining: seconds,
      source: `${DOMAIN_DISORDER_SOURCE}:${disorder}`,
    });
};

// Ends the disorders' bonuses, the team leaving the arena or the challenge ending, and no other buff
export const clearDomainDisorders = (kitEffectState: KitEffectState): void => {
  kitEffectState.effects = kitEffectState.effects.filter(
    (effect) => effect.kind !== "buff" || !effect.source?.startsWith(DOMAIN_DISORDER_SOURCE),
  );
};
