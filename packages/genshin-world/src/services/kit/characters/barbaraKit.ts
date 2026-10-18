import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHitBehaviour } from "#src/models/kit/KitHitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { regeneratePartyMemberEnergy } from "#src/services/party/regeneratePartyMemberEnergy";

// The Melody Loop's regeneration on the character on the field as it starts and every 5 seconds after, the four heals the
// Wiki's Let the Show Begin♪ notes give, as gcsim v2.47.2 (MIT) barbara/skill.go ticks it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/barbara/skill.go
const MELODY_LOOP_TICK_INTERVAL_SECONDS = 5;
// Encore, from Ascension 4, lengthens the Melody Loop a second for each particle the character on the field collects, up to
// Five seconds, as gcsim v2.47.2 (MIT) barbara/asc.go gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/barbara/asc.go
const ASCENSION_4 = 4;
const ENCORE_MAX_EXTENSION_SECONDS = 5;
const ENCORE_SECONDS_PER_PARTICLE = 1;
const ENCORE_STATUS_ID = "barbara-encore";
// Vitality Burst, from two constellations, cuts the skill's cooldown by 15% and gives a 15% Hydro DMG Bonus for the
// Melody Loop's duration, as the wiki's constellation page gives it, to each party member but Barbara, as the bonus of
// Gcsim v2.47.2 (MIT) barbara/cons.go does
// https://genshin-impact.fandom.com/wiki/Vitality_Burst
const VITALITY_BURST_CONSTELLATION = 2;
const VITALITY_BURST_COOLDOWN_MULTIPLIER = 0.85;
const VITALITY_BURST_HYDRO_DAMAGE_BONUS = 0.15;
// Dedicating Everything to You, from six constellations: a fallen member of the team, while Barbara is in the party but not on
// The field, is revived to all of its HP, once every fifteen minutes, as the wiki's constellation page gives it
const DEDICATING_EVERYTHING_TO_YOU_CONSTELLATION = 6;
const DEDICATING_EVERYTHING_TO_YOU_COOLDOWN_SECONDS = 15 * 60;
const DEDICATING_EVERYTHING_TO_YOU_HEALTH_SHARE = 1;
const DEDICATING_EVERYTHING_TO_YOU_STATUS_ID = "barbara-dedicating-everything-to-you";
// Gleeful Songs, from Constellation 1: she regenerates 1 Energy every 10 seconds while she stands in the party. A clock of
// 10 seconds on her status is armed on each step she is in the team, and its expiry gives the Energy, as gcsim v2.47.2
// (MIT) barbara/cons.go gives it on a task
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/barbara/cons.go
const GLEEFUL_SONGS_CONSTELLATION = 1;
const GLEEFUL_SONGS_ENERGY = 1;
const GLEEFUL_SONGS_SECONDS = 10;
const GLEEFUL_SONGS_STATUS_ID = "barbara-gleeful-songs";
// Attentiveness Be My Power, from Constellation 4: each opponent her charged attack strikes regenerates 1 Energy for her,
// Five at most per charged attack, as the wiki's constellation page gives it
const ATTENTIVENESS_CONSTELLATION = 4;
const ATTENTIVENESS_ENERGY = 1;
const ATTENTIVENESS_MAX_ENERGY = 5;

// The Melody Loop the striker cast that stands on the team: a field it cast that ticks on the loop's interval, which its
// Burst's single heal does not
const findLiveMelodyLoop = (striker: Combatant, effects: readonly KitEffect[]): KitField | undefined =>
  effects.find(
    (effect): effect is KitField =>
      effect.kind === "field" &&
      effect.characterId === striker.characterId &&
      effect.tickIntervalSeconds === MELODY_LOOP_TICK_INTERVAL_SECONDS &&
      effect.secondsRemaining > 0,
  );
const checkIsMelodyLoopLive = (striker: Combatant, effects: readonly KitEffect[]): boolean =>
  findLiveMelodyLoop(striker, effects) !== undefined;

// The Melody Loop's tick, written for Barbara as she cast it, with its heal in HP. Each heals the character on the
// Field by the regeneration, and the first gives every other member of the team Vitality Burst's Hydro DMG Bonus from
// Two constellations, for the loop's seconds
const createMelodyLoopTick =
  (owner: Combatant, regenerationHeal: number, loopSeconds: number) =>
  (context: KitContext, tickIndex: number): void => {
    const { activeCombatant, kitEffectState, party } = context;
    changeKitMemberHealth(context, owner, activeCombatant.characterId, regenerationHeal);
    if (tickIndex > 0 || owner.constellationCount < VITALITY_BURST_CONSTELLATION) return;
    for (const characterId of getDeployedCharacterIds(party))
      if (characterId !== owner.characterId)
        buffKitMember(kitEffectState, characterId, {
          amount: VITALITY_BURST_HYDRO_DAMAGE_BONUS,
          attribute: Attribute.HydroDamageBonus,
          secondsRemaining: loopSeconds,
        });
  };

export const BARBARA_CHARACTER_ID = 10_000_014;

// Barbara's behaviour: her strikes and her charged attack heal the party, certain while her Melody Loop stands and never
// Otherwise, with no shield needed. Let the Show Begin♪ casts its droplets as a summon and the Melody Loop as a field,
// Both where she stands and priced by her as she stood then, and Shining Miracle♪, which deals no damage, heals the
// Character on the field at its hitmark. From two constellations, Vitality Burst cuts the skill's cooldown, and the
// Loop's first tick gives the rest of the team its Hydro DMG Bonus, and from six constellations a fallen member is revived.
// Constellations 1 and 4 are built: 1's energy every ten seconds runs on a clock her kit arms on each step she is in the
// Team, and 4's energy per enemy her charged attack strikes is counted across the one attack
export const createBarbaraKitBehaviour = ({ readHits, readParameter, readSeconds }: KitRecordReader): KitBehaviour => {
  const regenerationHealthShare = readParameter("regenerationHealthShare");
  const regenerationFlatHeal = readParameter("regenerationFlatHeal");
  // The wiki's and the group's 15 seconds and gcsim's extra frame, so the fourth regeneration, 15 seconds after the
  // First, still falls within it
  const melodyLoopSeconds = readParameter("melodyLoopSeconds") + readSeconds("melodyLoopExtension");
  const melodyLoopStartSeconds = readSeconds("melodyLoopStart");
  const droplets = readHits("droplet");
  const burstHealthShare = readParameter("burstHealthShare");
  const burstFlatHeal = readParameter("burstFlatHeal");
  const shiningMiracleHealSeconds = readSeconds("shiningMiracleHeal");
  // The Melody Loop's heal on a hit, rolled certain while the loop stands and never otherwise
  const melodyLoopHealBehaviour: KitHitBehaviour = {
    healPartyChance: (striker, effects) => (checkIsMelodyLoopLive(striker, effects) ? 1 : 0),
  };
  const strikeBehaviour = { hits: [melodyLoopHealBehaviour] };
  // Attentiveness counts the Energy one charged attack has regenerated, which its start clears
  let attentivenessEnergy = 0;
  return {
    // Shining Miracle♪'s heal is a task run at its hitmark, priced by her as she stood at the cast
    burst: {
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        const burstHeal = burstFlatHeal + burstHealthShare * combatant.attributes.maxHealth;
        scheduleKitTask(kitEffectState, combatant.characterId, shiningMiracleHealSeconds, (tick) =>
          changeKitMemberHealth(tick, combatant, tick.activeCombatant.characterId, burstHeal),
        );
      },
    },
    // Constellation 4: each opponent her charged attack strikes regenerates Energy for her, up to five per attack
    chargedAttack: {
      hits: [
        {
          ...melodyLoopHealBehaviour,
          onStrike: ({ party }, { combatant }) => {
            if (
              combatant.constellationCount < ATTENTIVENESS_CONSTELLATION ||
              attentivenessEnergy >= ATTENTIVENESS_MAX_ENERGY
            )
              return;
            regeneratePartyMemberEnergy(party, combatant, ATTENTIVENESS_ENERGY);
            attentivenessEnergy += ATTENTIVENESS_ENERGY;
          },
        },
      ],
      onStart: () => {
        attentivenessEnergy = 0;
      },
    },
    getSkillCooldownMultiplier: ({ activeCombatant: combatant }) =>
      combatant.constellationCount >= VITALITY_BURST_CONSTELLATION ? VITALITY_BURST_COOLDOWN_MULTIPLIER : 1,
    normalAttacks: [strikeBehaviour, strikeBehaviour, strikeBehaviour, strikeBehaviour],
    // Gleeful Songs' clock arms on each step she is in the team, and its expiry gives the Energy
    onStep: ({ kitEffectState }, combatant) => {
      if (
        combatant.constellationCount < GLEEFUL_SONGS_CONSTELLATION ||
        findKitStatus(kitEffectState.effects, combatant.characterId, GLEEFUL_SONGS_STATUS_ID)
      )
        return;
      addKitStatus(kitEffectState, combatant.characterId, {
        id: GLEEFUL_SONGS_STATUS_ID,
        secondsRemaining: GLEEFUL_SONGS_SECONDS,
      });
    },
    // Encore lengthens the Melody Loop as particles are collected, up to its maximum extension
    // Dedicating Everything to You revives a downed member once every fifteen minutes while Barbara is off the field
    onKitEvent: (event, { activeCombatant, kitEffectState, party }, combatant) => {
      if (
        event.kind === KitEventKind.EffectExpired &&
        event.effect.kind === "status" &&
        event.effect.id === GLEEFUL_SONGS_STATUS_ID &&
        event.effect.characterId === combatant.characterId
      )
        regeneratePartyMemberEnergy(party, combatant, GLEEFUL_SONGS_ENERGY);
      if (event.kind === KitEventKind.EnergyParticleCollected && combatant.ascension >= ASCENSION_4) {
        const melodyLoop = findLiveMelodyLoop(combatant, kitEffectState.effects);
        const encore = findKitStatus(kitEffectState.effects, combatant.characterId, ENCORE_STATUS_ID);
        if (melodyLoop && encore) {
          const encoreSeconds = encore.stacks ?? 0;
          const extensionSeconds = Math.min(
            event.count * ENCORE_SECONDS_PER_PARTICLE,
            ENCORE_MAX_EXTENSION_SECONDS - encoreSeconds,
          );
          melodyLoop.secondsRemaining += extensionSeconds;
          encore.secondsRemaining += extensionSeconds;
          encore.stacks = encoreSeconds + extensionSeconds;
        }
      }
      if (
        event.kind === KitEventKind.HealthChanged &&
        combatant.constellationCount >= DEDICATING_EVERYTHING_TO_YOU_CONSTELLATION &&
        activeCombatant.characterId !== combatant.characterId &&
        getDeployedCharacterIds(party).includes(event.characterId) &&
        getPartyMember(party, event.characterId).healthShare === 0 &&
        startKitCooldown(
          kitEffectState,
          combatant.characterId,
          DEDICATING_EVERYTHING_TO_YOU_STATUS_ID,
          DEDICATING_EVERYTHING_TO_YOU_COOLDOWN_SECONDS,
        )
      )
        getPartyMember(party, event.characterId).healthShare = DEDICATING_EVERYTHING_TO_YOU_HEALTH_SHARE;
    },
    // The droplets are a summon and the Melody Loop a field, both cast where Barbara stands and priced by her as she
    // Stood then
    skill: {
      onStart: ({ activeCombatant: combatant, body: { facing, height, position }, kitEffectState }) => {
        castKitSummon(kitEffectState, { facing, height, position }, combatant, droplets);
        if (combatant.ascension >= ASCENSION_4)
          addKitStatus(kitEffectState, combatant.characterId, {
            id: ENCORE_STATUS_ID,
            secondsRemaining: melodyLoopStartSeconds + melodyLoopSeconds,
            stacks: 0,
          });
        castKitField(kitEffectState, combatant.characterId, position, {
          nextTickSeconds: melodyLoopStartSeconds,
          onTick: createMelodyLoopTick(
            combatant,
            regenerationFlatHeal + regenerationHealthShare * combatant.attributes.maxHealth,
            melodyLoopSeconds,
          ),
          secondsRemaining: melodyLoopStartSeconds + melodyLoopSeconds,
          tickIntervalSeconds: MELODY_LOOP_TICK_INTERVAL_SECONDS,
        });
      },
    },
  };
};
