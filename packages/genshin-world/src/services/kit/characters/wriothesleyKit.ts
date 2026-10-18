import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStanceActions } from "#src/models/kit/KitStanceActions";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { collectDelayedKitEnergy } from "#src/services/kit/effects/collectDelayedKitEnergy";
import { delayKitEnergy } from "#src/services/kit/effects/delayKitEnergy";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";
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

// An enhanced strike, one of the normal attacks Chilling Penalty plays: it drains him once every 6 frames, and a particle
// Comes every 2 seconds
const strikeEnhanced: NonNullable<KitHitBehaviour["onStrike"]> = (context, { combatant }) => {
  const { attributes, characterId } = combatant;
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

// Chilling Penalty, the stance Icefang Rush holds, is held for as long as the skill holds and his HP is above half, as
// Skill.go's skillBuffActive reads it. While it holds his normal attacks play its actions, each enhanced strike draining him
// And giving a particle. At half or less they play his base actions, which drain nothing. Not built yet: Darkgold Wolfbite's
// Surging Blade, which hits past the burst's animation with a multiplier the record does not hold, and the charged attack's
// Ascension 1 Gracious Rebuke, which needs a charged attack variant and a damage bonus that reads an effect, where the strike
// Damage bonus reads none. Constellation 1, 2, 4 and 6 all build on that Rebuke or on Prosecution Edict's stacks in a damage
// Bonus, and wait on the same pieces
const checkIsChillingPenaltyStance =
  (characterId: number) =>
  (effect: KitEffect): boolean =>
    effect.kind === "stance" && effect.characterId === characterId;

// Holds Chilling Penalty while Icefang Rush holds and his HP is above half, and drops it otherwise. A recast of the skill
// Restarts it with the status's full seconds, as the status restarts
const syncChillingPenalty = (
  context: KitContext,
  combatant: Combatant,
  chillingPenalty: KitStanceActions,
  isRecast = false,
): void => {
  const { characterId } = combatant;
  const { kitEffectState } = context;
  const icefangRush = findKitStatus(kitEffectState.effects, characterId, ICEFANG_RUSH_ID);
  if (!icefangRush || getPartyMember(context.party, characterId).healthShare <= ENHANCEMENT_HEALTH_SHARE) {
    removeKitEffects(kitEffectState, checkIsChillingPenaltyStance(characterId));
    return;
  }
  if (isRecast) removeKitEffects(kitEffectState, checkIsChillingPenaltyStance(characterId));
  if (kitEffectState.effects.some(checkIsChillingPenaltyStance(characterId))) return;
  enterKitStance(kitEffectState, combatant, chillingPenalty, icefangRush.secondsRemaining, { isEndedOnSwap: true });
};

export const createWriothesleyKitBehaviour = ({ readStance }: KitRecordReader): KitBehaviour => {
  // The five normal attacks Chilling Penalty plays, each strike of them enhanced, the fourth attack's two strikes too
  const enhancedStrike = { onStrike: strikeEnhanced };
  const chillingPenalty = readStance("chillingPenalty", {
    normalAttacks: [
      { hits: [enhancedStrike] },
      { hits: [enhancedStrike] },
      { hits: [enhancedStrike] },
      { hits: [enhancedStrike, enhancedStrike] },
      { hits: [enhancedStrike] },
    ],
  });
  return {
    onKitEvent: (event, context, combatant) => {
      collectDelayedKitEnergy(event, context, combatant, PARTICLE_DELAY_ID);
      if (event.kind !== KitEventKind.HealthChanged) return;
      gainProsecutionEdictStack(context, combatant, event);
      syncChillingPenalty(context, combatant, chillingPenalty);
    },
    skill: {
      onStart: (context) => {
        startIcefangRush(context);
        syncChillingPenalty(context, context.activeCombatant, chillingPenalty, true);
      },
    },
  };
};
