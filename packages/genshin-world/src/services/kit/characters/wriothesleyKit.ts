import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { collectDelayedKitEnergy } from "#src/services/kit/effects/collectDelayedKitEnergy";
import { delayKitEnergy } from "#src/services/kit/effects/delayKitEnergy";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { getPartyMember } from "#src/services/party/getPartyMember";

export const WRIOTHESLEY_CHARACTER_ID = 10_000_086;

// Icefang Rush's ten seconds and a frame, as gcsim v2.47.2 (MIT) internal/characters/wriothesley/skill.go gives the status
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/wriothesley/skill.go
const ICEFANG_RUSH_ID = "wriothesley-icefang-rush";
const ICEFANG_RUSH_SECONDS = toKitSeconds(10 * 60 + 1);
// The enhancement holds only while his HP is above half of his Max HP, as skill.go's skillBuffActive reads it
const ENHANCEMENT_HEALTH_SHARE = 0.5;

// Chilling Penalty drains 4.5% of his Max HP from an enhanced strike, once every 6 frames
// As skill.go's chillingPenalty and skillLoseHPICD give it
const CHILLING_PENALTY_SHARE = 0.045;
const CHILLING_PENALTY_COOLDOWN_ID = "wriothesley-chilling-penalty-cooldown";
const CHILLING_PENALTY_COOLDOWN_SECONDS = toKitSeconds(6);

// An enhanced strike gives one Cryo particle every 2 seconds, which lands 100 frames later
// At the default ParticleDelay, as skill.go's particleCB and particleICD give it
const PARTICLE_COOLDOWN_ID = "wriothesley-particle-cooldown";
const PARTICLE_COOLDOWN_SECONDS = toKitSeconds(2 * 60);
const PARTICLE_DELAY_ID = "wriothesley-particle";
const PARTICLE_DELAY_SECONDS = toKitSeconds(100);
const PARTICLE_ENERGY = 1;

// Prosecution Edict from Ascension 4, as asc.go's a4 gives it: each self-drain of his HP, and each heal that restores some,
// While Icefang Rush holds and he is on the field, adds a stack up to five, and each stack raises his ATK by 6% for as long
// As the skill does. Recasting the skill resets the stacks
const ASCENSION_4 = 4;
const PROSECUTION_EDICT_ID = "wriothesley-prosecution-edict";
const PROSECUTION_EDICT_MAX_STACKS = 5;
const PROSECUTION_EDICT_ATTACK_SHARE = 0.06;

// Whether Icefang Rush holds on him and his strikes are enhanced, which needs his HP above half
const checkIsEnhanced = ({ kitEffectState: { effects }, party }: KitContext, characterId: number): boolean =>
  checkIsKitStatusActive(effects, characterId, ICEFANG_RUSH_ID) &&
  getPartyMember(party, characterId).healthShare > ENHANCEMENT_HEALTH_SHARE;

// Sets the stacks Prosecution Edict holds and the ATK share its buff gives for them, both lasting as long as the edict does
const setProsecutionEdictStacks = (context: KitContext, characterId: number, stacks: number): void => {
  const edict = findKitStatus(context.kitEffectState.effects, characterId, PROSECUTION_EDICT_ID);
  if (!edict) return;
  const { secondsRemaining } = edict;
  addKitStatus(context.kitEffectState, characterId, { id: PROSECUTION_EDICT_ID, secondsRemaining, stacks });
  buffKitMember(context.kitEffectState, characterId, {
    amount: PROSECUTION_EDICT_ATTACK_SHARE * stacks,
    attribute: Attribute.AttackPercent,
    secondsRemaining,
    source: PROSECUTION_EDICT_ID,
  });
};

// Starts Icefang Rush, and from Ascension 4 starts Prosecution Edict over with no stacks, as gcsim's resetA4 does on a cast
const startIcefangRush = (context: KitContext): void => {
  const { activeCombatant: combatant, kitEffectState } = context;
  const { characterId } = combatant;
  addKitStatus(kitEffectState, characterId, {
    id: ICEFANG_RUSH_ID,
    isEndedOnSwap: true,
    secondsRemaining: ICEFANG_RUSH_SECONDS,
  });
  if (combatant.ascension < ASCENSION_4) return;
  addKitStatus(kitEffectState, characterId, {
    id: PROSECUTION_EDICT_ID,
    secondsRemaining: ICEFANG_RUSH_SECONDS,
    stacks: 0,
  });
  setProsecutionEdictStacks(context, characterId, 0);
};

// Gives Prosecution Edict a stack for a self-drain, or a heal that restores HP, of his while Icefang Rush holds and he is
// On the field
const gainProsecutionEdictStack = (context: KitContext, combatant: Combatant, event: KitHealthChangedEvent): void => {
  const { characterId, ascension } = combatant;
  if (ascension < ASCENSION_4 || event.characterId !== characterId) return;
  const isGain = event.healthShare > 0 || (event.healthShare < 0 && event.sourceCharacterId === characterId);
  if (!isGain || context.activeCombatant.characterId !== characterId) return;
  if (!checkIsKitStatusActive(context.kitEffectState.effects, characterId, ICEFANG_RUSH_ID)) return;
  const stacks = findKitStatus(context.kitEffectState.effects, characterId, PROSECUTION_EDICT_ID)?.stacks ?? 0;
  if (stacks < PROSECUTION_EDICT_MAX_STACKS) setProsecutionEdictStacks(context, characterId, stacks + 1);
};

// An enhanced strike of his normal attacks: Chilling Penalty drains him once every 6 frames, and a particle comes every 2
// Seconds. The strike's enhanced damage multiplier and hitbox are not built, as the record does not hold them
const strikeEnhanced: NonNullable<KitHitBehaviour["onStrike"]> = (context, { combatant }) => {
  const { attributes, characterId } = combatant;
  if (!checkIsEnhanced(context, characterId)) return;
  if (!checkIsKitStatusActive(context.kitEffectState.effects, characterId, CHILLING_PENALTY_COOLDOWN_ID)) {
    addKitStatus(context.kitEffectState, characterId, {
      id: CHILLING_PENALTY_COOLDOWN_ID,
      secondsRemaining: CHILLING_PENALTY_COOLDOWN_SECONDS,
    });
    changeKitMemberHealth(context, combatant, characterId, -CHILLING_PENALTY_SHARE * attributes.maxHealth);
  }
  if (checkIsKitStatusActive(context.kitEffectState.effects, characterId, PARTICLE_COOLDOWN_ID)) return;
  addKitStatus(context.kitEffectState, characterId, {
    id: PARTICLE_COOLDOWN_ID,
    secondsRemaining: PARTICLE_COOLDOWN_SECONDS,
  });
  delayKitEnergy(context.kitEffectState, characterId, {
    energy: PARTICLE_ENERGY,
    id: PARTICLE_DELAY_ID,
    seconds: PARTICLE_DELAY_SECONDS,
  });
};

// Wriothesley's behaviour: Icefang Rush holds for ten seconds, and while his HP is above half each of his normal attacks'
// Strikes drains him by Chilling Penalty and gives a particle, and from Ascension 4 his Prosecution Edict stacks and ATK.
// Not built yet: the enhanced strikes' damage multiplier and larger hitboxes, which the record does not hold (gcsim's
// Snapshot multiplies a normal attack by the skill's own table, and skill.go's enhanced boxes differ from the base ones),
// Darkgold Wolfbite's Surging Blade, which hits past the burst's animation with a multiplier the record does not hold, and
// The charged attack's Ascension 1 Gracious Rebuke, which needs a charged attack variant and a damage bonus that reads an
// Effect, where the strike damage bonus reads none. Constellation 1, 2, 4 and 6 all build on that Rebuke or on Prosecution
// Edict's stacks in a damage bonus, and wait on the same pieces
export const createWriothesleyKitBehaviour = (): KitBehaviour => {
  // The five normal attacks, each strike enhanced as the skill's state allows, with the fourth attack's two strikes
  const enhancedStrike = { onStrike: strikeEnhanced };
  return {
    normalAttacks: [
      { hits: [enhancedStrike] },
      { hits: [enhancedStrike] },
      { hits: [enhancedStrike] },
      { hits: [enhancedStrike, enhancedStrike] },
      { hits: [enhancedStrike] },
    ],
    onKitEvent: (event, context, combatant) => {
      collectDelayedKitEnergy(event, context, combatant, PARTICLE_DELAY_ID);
      if (event.kind === KitEventKind.HealthChanged) gainProsecutionEdictStack(context, combatant, event);
    },
    skill: { onStart: startIcefangRush },
  };
};
