import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { STELLAR_VORTEX_MAX_STACKS } from "#src/services/kit/constants";
import { detonateStellarVortex } from "#src/services/kit/detonateStellarVortex";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findStandingKitSummon } from "#src/services/kit/effects/findStandingKitSummon";
import { removeKitEffects } from "#src/services/kit/effects/removeKitEffects";

export const ODETTE_CHARACTER_ID = 10_000_150;

export const DANCE_DOUBLE_ID = "danceDouble";
export const STELLAR_VORTEX_ID = "stellarVortex";
// The Dance Double's two attacks by their index in the order they alternate in: Plume, then Wing, then Plume again
const PLUME = 0;
const WING = 1;

const checkIsStellarVortex = (effect: KitEffect): effect is KitSummon =>
  effect.kind === "summon" && effect.id === STELLAR_VORTEX_ID;

// Odette's behaviour: her Dance Double, which her skill and her burst each summon, alternating Plume and Wing on the
// Intervals gcsim gives them. A Stellar Swirl leaves a Stellar Vortex, one at a time. Her Polestar Field on a Stellar-Conduct is
// Not kept here: the reaction path places it for any enabler's Stellar-Conduct (`addPolestarField`). This places the
// Vortex on the next step, where gcsim v2.47.2 creates it inside the reaction (pkg/reactable/stellarswirl_gadget.go)
// Each further Stellar Swirl adds a stack, and the sixth explodes it at once, while one that runs out explodes as it stands
// https://genshin-impact.fandom.com/wiki/Odette
export const createOdetteKitBehaviour = ({ kit, readHit, readSeconds }: KitRecordReader): KitBehaviour => {
  const danceDoubleDurationSeconds = readSeconds("danceDoubleDuration");
  const recastDanceDoubleFirstTickSeconds = readSeconds("danceDoubleRecastFirstTick");
  // Each attack's hit, and the seconds gcsim waits from it to the other attack
  const danceDoubleAttacks: [{ hit: KitHit; intervalSeconds: number }, { hit: KitHit; intervalSeconds: number }] = [
    { hit: readHit("plume"), intervalSeconds: readSeconds("plumeTickInterval") },
    { hit: readHit("wing"), intervalSeconds: readSeconds("wingTickInterval") },
  ];
  // The skill and the burst each summon the Dance Double a while after their own start, and its first tick counts from there
  const skillDanceDouble = {
    firstTickSeconds: readSeconds("danceDoubleFirstTick"),
    spawnSeconds: readSeconds("danceDoubleSkillSpawn"),
  };
  const burstDanceDouble = {
    firstTickSeconds: readSeconds("danceDoubleBurstFirstTick"),
    spawnSeconds: readSeconds("danceDoubleBurstSpawn"),
  };
  const stellarVortexSeconds = readSeconds("stellarVortex");

  // The Dance Double's hits from its summon, alternating from the attack given on each attack's interval, while its status runs
  const createDanceDoubleHits = (
    firstAttack: typeof PLUME | typeof WING,
    firstTickSeconds: number,
    spawnSeconds: number,
  ): KitHit[] => {
    const hits: KitHit[] = [];
    let attack = firstAttack;
    for (let hitmarkSeconds = firstTickSeconds; hitmarkSeconds < danceDoubleDurationSeconds;) {
      const { hit, intervalSeconds } = danceDoubleAttacks[attack];
      hits.push({ ...hit, hitmarkSeconds: spawnSeconds + hitmarkSeconds });
      hitmarkSeconds += intervalSeconds;
      attack = attack === PLUME ? WING : PLUME;
    }
    return hits;
  };
  // A summon of the Dance Double ends any standing one, as gcsim's new ticker chain cancels the old one's
  const summonDanceDouble = (
    kitEffectState: KitEffectState,
    body: KitBody,
    combatant: Combatant,
    firstAttack: typeof PLUME | typeof WING,
    { firstTickSeconds, spawnSeconds }: { firstTickSeconds: number; spawnSeconds: number },
  ): void => {
    for (const effect of kitEffectState.effects)
      if (effect.kind === "summon" && effect.id === DANCE_DOUBLE_ID) effect.secondsRemaining = 0;
    castKitSummon(kitEffectState, body, combatant, createDanceDoubleHits(firstAttack, firstTickSeconds, spawnSeconds), {
      attackTag: AttackTag.ElementalSkill,
      id: DANCE_DOUBLE_ID,
      secondsRemaining: spawnSeconds + danceDoubleDurationSeconds,
      spawnSeconds,
    });
  };
  // Her Coda recast restarts a standing Dance Double on a Plume, from the recast's own clock, on the status it already has
  const restartDanceDouble = (kitEffectState: KitEffectState, characterId: number): void => {
    const standing = findStandingKitSummon(kitEffectState.effects, DANCE_DOUBLE_ID, characterId);
    if (!standing) return;
    const spawnSeconds = standing.spawnSeconds ?? 0;
    const restartSeconds = standing.elapsedSeconds + recastDanceDoubleFirstTickSeconds - spawnSeconds;
    standing.hits = [
      ...standing.hits.slice(0, standing.nextHitIndex),
      ...createDanceDoubleHits(PLUME, restartSeconds, spawnSeconds),
    ];
  };
  // The attack a standing Dance Double does next, which a burst's Dance Double takes up rather than starting over. Each
  // Hit keeps its attack's area from the record, so the area names which attack the next hit is
  const findNextDanceDoubleAttack = (
    kitEffectState: KitEffectState,
    characterId: number,
  ): typeof PLUME | typeof WING => {
    const standing = findStandingKitSummon(kitEffectState.effects, DANCE_DOUBLE_ID, characterId);
    const nextHit = standing?.hits[standing.nextHitIndex];
    return nextHit?.hitArea === danceDoubleAttacks[WING].hit.hitArea ? WING : PLUME;
  };

  return {
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        summonDanceDouble(
          kitEffectState,
          body,
          combatant,
          findNextDanceDoubleAttack(kitEffectState, combatant.characterId),
          burstDanceDouble,
        );
      },
    },
    onKitEvent: (event, context, combatant) => {
      if (event.kind === KitEventKind.EffectExpired) {
        if (checkIsStellarVortex(event.effect)) detonateStellarVortex(event.effect, context);
        return;
      }
      if (event.kind !== KitEventKind.ReactionTriggered) return;
      const { body, kitEffectState } = context;
      for (const { reactionType } of event.reactions) {
        if (reactionType !== ReactionType.StellarSwirl) continue;
        const vortex = kitEffectState.effects.find(checkIsStellarVortex);
        if (!vortex) {
          castKitSummon(kitEffectState, body, combatant, [], {
            id: STELLAR_VORTEX_ID,
            secondsRemaining: stellarVortexSeconds,
            stacks: 1,
          });
          continue;
        }
        // A further Stellar Swirl adds a stack without renewing the vortex's lifetime, as gcsim leaves it
        vortex.stacks = (vortex.stacks ?? 0) + 1;
        if (vortex.stacks < STELLAR_VORTEX_MAX_STACKS) continue;
        removeKitEffects(kitEffectState, (effect) => effect === vortex);
        detonateStellarVortex(vortex, context);
      }
    },
    skill: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        summonDanceDouble(kitEffectState, body, combatant, PLUME, skillDanceDouble);
      },
    },
    skillChain: kit.elementalSkillChain?.followUps.map(() => ({
      onStart: ({ activeCombatant: combatant, kitEffectState }) => {
        restartDanceDouble(kitEffectState, combatant.characterId);
      },
    })),
  };
};
