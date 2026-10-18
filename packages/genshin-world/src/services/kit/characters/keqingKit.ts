import type { Reaction } from "#src/models/combat/Reaction";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";

// Thundering Penance, as the dump's Keqing_PermanentSkill_1 row (promote 1, param 5.0) and gcsim v2.47.2 (MIT)
// Keqing/asc.go give it: from Ascension 1, the Lightning Stiletto's recast infuses her attacks with Electro for 5 seconds.
// Gcsim holds it 20 frames longer than the table's seconds, which stand
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/keqing/asc.go
const THUNDERING_PENANCE_ASCENSION = 1;
const THUNDERING_PENANCE_SECONDS = 5;
// Measured: gcsim v2.47.2 (MIT) keqing/asc.go, A4: Starward Sword gives Keqing 15% CRIT Rate and 15% Energy Recharge for
// 8 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/keqing/asc.go
const STARWARD_SWORD_ASCENSION = 4;
const STARWARD_SWORD_CRITICAL_RATE = 0.15;
const STARWARD_SWORD_ENERGY_RECHARGE = 0.15;
const STARWARD_SWORD_SECONDS = 8;
// Constellation 1: the recast adds an Electro hit of 50% of ATK 3 frames into it and another at its own hitmark.
// As gcsim v2.47.2 (MIT) keqing/skill.go gives them, the wiki's point-blank range is not checked either
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/keqing/skill.go
const ELECTRO_INFUSION_SECONDS = 5;
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_START_FRAMES = 3;
const CONSTELLATION_1_TALENT_MULTIPLIER = 0.5;
// Constellation 4: an Electro-related reaction Keqing triggers gives her 25% ATK for 10 seconds, as gcsim v2.47.2 (MIT)
// The cons.go and keqing.go files give it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/keqing/cons.go
const CONSTELLATION_4 = 4;
const CONSTELLATION_4_ATTACK_BONUS = 0.25;
const CONSTELLATION_4_SECONDS = 10;
// Constellation 6: each Normal Attack, Charged Attack, Elemental Skill and Burst gives her 6% Electro DMG Bonus for 8
// Seconds, from a source of its own so the same kind of action restarts it, as gcsim v2.47.2 (MIT) keqing/cons.go gives it
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_ELECTRO_DAMAGE_BONUS = 0.06;
const CONSTELLATION_6_SECONDS = 8;

// The reactions Constellation 4 counts, as gcsim subscribes to them: the Electro ones, and Hyperbloom, which gcsim counts
// Whatever its element. Swirl and Crystallize count only when they are Electro
const CONSTELLATION_4_REACTIONS: ReadonlySet<ReactionType> = new Set([
  ReactionType.Aggravate,
  ReactionType.ElectroCharged,
  ReactionType.Hyperbloom,
  ReactionType.LunarCharged,
  ReactionType.Overloaded,
  ReactionType.Quicken,
  ReactionType.Superconduct,
]);

const checkIsConstellation4Reaction = ({ element, reactionType }: Reaction): boolean =>
  CONSTELLATION_4_REACTIONS.has(reactionType) ||
  ((reactionType === ReactionType.Swirl || reactionType === ReactionType.Crystallize) && element === Element.Electro);

// Constellation 6's Electro DMG Bonus from the start of an action, which the same kind of action restarts for its source
const addConstellation6Bonus = (
  { activeCombatant: { characterId, constellationCount }, kitEffectState }: KitContext,
  source: string,
): void => {
  if (constellationCount < CONSTELLATION_6) return;
  buffKitMember(kitEffectState, characterId, {
    amount: CONSTELLATION_6_ELECTRO_DAMAGE_BONUS,
    attribute: Attribute.ElectroDamageBonus,
    secondsRemaining: CONSTELLATION_6_SECONDS,
    source: `keqing-constellation-6-${source}`,
  });
};

// Constellation 1's two Electro hits on the recast, copied from its own hit so each keeps its hitmark's tags
const addConstellation1Hits = (
  { activeCombatant: combatant, body, kitEffectState }: KitContext,
  recastHit: KitHit,
): void => {
  castKitSummon(kitEffectState, body, combatant, [
    {
      ...recastHit,
      element: Element.Electro,
      hitmarkSeconds: toKitSeconds(CONSTELLATION_1_START_FRAMES),
      poiseDamage: 0,
      talentMultiplier: CONSTELLATION_1_TALENT_MULTIPLIER,
    },
    { ...recastHit, element: Element.Electro, poiseDamage: 0, talentMultiplier: CONSTELLATION_1_TALENT_MULTIPLIER },
  ]);
};

export const KEQING_CHARACTER_ID = 10_000_042;

// Keqing's behaviour: the Lightning Stiletto's recast, a second press of Stellar Restoration within its window, infuses
// Her attacks with Electro for the infusion's seconds as it starts, and adds Constellation 1's two Electro hits. From
// Ascension 4 Starward Sword gives her CRIT Rate and Energy Recharge. Constellations 1, 4 and 6 are built. Constellation 2
// Is not, as it needs an Elemental Particle from each hit on an enemy holding Electro, and a kit's hit carries no particle
// Drop. Her other passives are not built, as no kit event reaches a value the fetched sources give
export const createKeqingKitBehaviour = ({ kit }: KitRecordReader): KitBehaviour => {
  const [recastHit] = kit.elementalSkillChain?.followUps[0]?.hits ?? [];
  return {
    burst: {
      onStart: (context) => {
        const { activeCombatant: combatant, kitEffectState } = context;
        if (combatant.ascension >= STARWARD_SWORD_ASCENSION) {
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: STARWARD_SWORD_CRITICAL_RATE,
            attribute: Attribute.CriticalRate,
            secondsRemaining: STARWARD_SWORD_SECONDS,
            source: "keqing-starward-sword-critical-rate",
          });
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: STARWARD_SWORD_ENERGY_RECHARGE,
            attribute: Attribute.EnergyRecharge,
            secondsRemaining: STARWARD_SWORD_SECONDS,
            source: "keqing-starward-sword-energy-recharge",
          });
        }
        addConstellation6Bonus(context, "burst");
      },
    },
    chargedAttack: { onStart: (context) => addConstellation6Bonus(context, "charge") },
    normalAttacks: kit.normalAttacks.map(() => ({
      onStart: (context: KitContext) => addConstellation6Bonus(context, "attack"),
    })),
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.ReactionTriggered ||
        combatant.constellationCount < CONSTELLATION_4 ||
        event.striker.characterId !== combatant.characterId
      )
        return;
      for (const reaction of event.reactions)
        if (checkIsConstellation4Reaction(reaction))
          buffKitMember(kitEffectState, combatant.characterId, {
            amount: CONSTELLATION_4_ATTACK_BONUS,
            attribute: Attribute.AttackPercent,
            secondsRemaining: CONSTELLATION_4_SECONDS,
            source: "keqing-constellation-4",
          });
    },
    skill: { onStart: (context) => addConstellation6Bonus(context, "skill") },
    skillChain: [
      {
        onStart: (context) => {
          const { activeCombatant: combatant, kitEffectState } = context;
          if (combatant.ascension >= THUNDERING_PENANCE_ASCENSION)
            addKitEffect(kitEffectState, {
              characterId: combatant.characterId,
              element: Element.Electro,
              kind: "infusion",
              secondsRemaining: ELECTRO_INFUSION_SECONDS,
            });
          if (recastHit && combatant.constellationCount >= CONSTELLATION_1) addConstellation1Hits(context, recastHit);
        },
      },
    ],
  };
};
