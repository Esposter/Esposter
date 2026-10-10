import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Reaction } from "#src/models/combat/Reaction";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { healPartyMember } from "#src/services/party/healPartyMember";

// Fischl's proud skill groups, read at her talent level. The attack group holds the five arrows at 0 to 4, the aimed shot
// At 5 and the fully charged aimed shot at 6, and the plunges' collision, low and high at 7, 8 and 9, the layout the
// Amber's and the Traveler's groups share. The skill group holds Oz's attack at 0 and its summon at 1, the duration at 3
// And the skill's cooldown at 4. The burst group holds Midnight Phantasmagoria at 0, its cooldown at 4 and its energy cost
// At 5
const FISCHL_ATTACK_GROUP_ID = 3131;
const FISCHL_SKILL_GROUP_ID = 3132;
const FISCHL_BURST_GROUP_ID = 3139;

// Provisional: the reach the targeting reads for the strikes, the skill and the burst, as the other kits' are
const STRIKE_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 6, radius: 5 });
const SKILL_TARGETING_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 10, radius: 15 });

// Measured: gcsim v2.47.2 (MIT) fischl/attack.go, each arrow's hitmark and the frame its action cancels at. The arrow lands
// At the primary target through a box a metre long, so it is priced as a circle of a metre round the body, as Amber's are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/fischl/attack.go
const ARROW_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
// Each arrow's hitmark and cancel frame, in the order of the five normal attacks
const ARROW_FRAMES = [
  { cancelFrames: 25, hitmarkFrames: 15 },
  { cancelFrames: 22, hitmarkFrames: 11 },
  { cancelFrames: 38, hitmarkFrames: 24 },
  { cancelFrames: 32, hitmarkFrames: 26 },
  { cancelFrames: 67, hitmarkFrames: 21 },
];
// Measured: gcsim v2.47.2 (MIT) fischl/aimed.go, the fully charged shot at 86 frames, travelling 10
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/fischl/aimed.go
const FULL_AIM_HITMARK_FRAMES = 86;
const FULL_AIM_SECONDS = 96 / 60;
const ARROW_TRAVEL_FRAMES = 10;

// Measured: gcsim v2.47.2 (MIT) fischl/skill.go, Oz's summon hitting at 38 frames after the press's 18-frame spawn, and its
// Attacks every 59 frames from 82 frames, each landing 10 frames on. Oz stands for 600 frames from its spawn, and the
// Animation runs 43 frames
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/fischl/skill.go
const SKILL_SECONDS = 43 / 60;
const OZ_SUMMON_HITMARK_FRAMES = 38;
const OZ_SPAWN_FRAMES = 18;
const OZ_FIRST_TICK_FRAMES = 64;
const OZ_TICK_INTERVAL_FRAMES = 59;
const OZ_DURATION_FRAMES = 600;
// The burst spawns the full Oz at 113 frames, and its first attack comes 69 frames later. Cut short by a swap, it spawns
// Oz a frame after the swap instead, its first attack 63 frames later
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/fischl/burst.go
const BURST_OZ_SPAWN_FRAMES = 113;
const BURST_OZ_FIRST_TICK_FRAMES = 69;
const BURST_SHORT_OZ_SPAWN_FRAMES = 1;
const BURST_SHORT_OZ_FIRST_TICK_FRAMES = 63;
const BURST_HITMARK_FRAMES = 18;
const BURST_FRAMES = 148;

// Measured: the wiki's Nightrider advanced properties, the summon's 80 poise with no internal cooldown, and Oz's attacks'
// 10 under the Elemental Skill internal cooldown. Midnight Phantasmagoria's advanced properties give it 2U and 150 poise
// https://genshin-impact.fandom.com/wiki/Nightrider
const OZ_SUMMON_POISE_DAMAGE = 80;
const OZ_POISE_DAMAGE = 10;
const MIDNIGHT_PHANTASMAGORIA_POISE_DAMAGE = 150;

// Provisional: gcsim gives the arrows and plunges no poise, so these stand in until a source gives them
const ARROW_POISE_DAMAGE = 12.9;
const FULL_AIM_POISE_DAMAGE = 20;
const PLUNGE_COLLISION_POISE_DAMAGE = 10;
const LOW_PLUNGE_POISE_DAMAGE = 50;
const HIGH_PLUNGE_POISE_DAMAGE = 100;
const PLUNGE_COLLISION_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });
const LOW_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 3 });
const HIGH_PLUNGE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 });

// Measured: gcsim v2.47.2 (MIT) fischl/burst.go, Midnight Phantasmagoria's circle on the body of radius 0.5
const BURST_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.5 });
// Measured: gcsim v2.47.2 (MIT) fischl/skill.go, Oz's spawn strikes a circle of radius 2 on the primary target, and of 3
// From two constellations, and each of its attacks a box a metre long there, priced as a circle of a metre as the arrows
// Are. Oz stands where Fischl cast it, so each is priced round its body at the skill's reach plus their own
const OZ_SUMMON_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 2);
const OZ_ATTACK_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 1);

// Undone Be Thy Sinful Hex, from Ascension 4: an Electro-related reaction the character on the field triggers while Oz
// Stands strikes the enemy with Thundering Retribution, 80% of Fischl's ATK as Oz snapshot it, at most once every 0.5
// Seconds for each character. Measured: gcsim v2.47.2 (MIT) fischl/asc.go, its circle of radius 0.5 on the enemy 4 frames
// On, and the wiki's 1U and 40 poise with no internal cooldown
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/fischl/asc.go
// https://genshin-impact.fandom.com/wiki/Undone_Be_Thy_Sinful_Hex
const UNDONE_BE_THY_SINFUL_HEX_ASCENSION = 4;
const THUNDERING_RETRIBUTION_COOLDOWN_STATUS_ID = "fischl-thundering-retribution-cooldown";
const THUNDERING_RETRIBUTION_COOLDOWN_SECONDS = 0.5;
const THUNDERING_RETRIBUTION_HIT: KitHit = Object.freeze({
  element: Element.Electro,
  gauge: 1,
  hitArea: Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 0.5 }),
  hitmarkSeconds: 4 / 60,
  poiseDamage: 40,
  talentMultiplier: 0.8,
});
// The reactions that are Electro-related whatever element they swirl or crystallize, as the wiki counts Quicken and
// Aggravate and not Spread. https://genshin-impact.fandom.com/wiki/Undone_Be_Thy_Sinful_Hex
const ELECTRO_REACTION_TYPES = new Set<ReactionType>([
  ReactionType.Aggravate,
  ReactionType.ElectroCharged,
  ReactionType.Hyperbloom,
  ReactionType.Overloaded,
  ReactionType.Quicken,
  ReactionType.Superconduct,
]);

// Gaze of the Deep, from one constellation: while Oz is not on the field, each of Fischl's normal attacks fires a
// Coordinated attack of 22% of her ATK as Physical DMG along with it. Measured: gcsim v2.47.2 (MIT) fischl/attack.go,
// And the wiki's 30 poise. https://genshin-impact.fandom.com/wiki/Gaze_of_the_Deep
const GAZE_OF_THE_DEEP_CONSTELLATION = 1;
const GAZE_OF_THE_DEEP_HIT: KitHit = Object.freeze({
  hitArea: ARROW_HIT_AREA,
  hitmarkSeconds: ARROW_TRAVEL_FRAMES / 60,
  poiseDamage: 30,
  talentMultiplier: 0.22,
});
// Devourer of All Sins, from two constellations: Oz's summon deals 200% more of Fischl's ATK, over a radius of 3
const DEVOURER_OF_ALL_SINS_CONSTELLATION = 2;
const DEVOURER_OF_ALL_SINS_TALENT_MULTIPLIER = 2;
const DEVOURER_OF_ALL_SINS_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 3);
// Her Pilgrimage of Bleak, from four constellations: the burst deals 222% of Fischl's ATK round her at 8 frames, 2U under
// The Elemental Burst internal cooldown with 500 poise, and heals her by 20% of her Max HP a frame after Oz spawns.
// Measured: gcsim v2.47.2 (MIT) fischl/burst.go, and the wiki's advanced properties
// https://genshin-impact.fandom.com/wiki/Her_Pilgrimage_of_Bleak
const HER_PILGRIMAGE_OF_BLEAK_CONSTELLATION = 4;
const HER_PILGRIMAGE_OF_BLEAK_HIT: KitHit = Object.freeze({
  element: Element.Electro,
  gauge: 2,
  hitArea: Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 5 }),
  hitmarkSeconds: 8 / 60,
  internalCooldownTag: InternalCooldownTag.ElementalBurst,
  poiseDamage: 500,
  talentMultiplier: 2.22,
});
const HER_PILGRIMAGE_OF_BLEAK_HEALTH_SHARE = 0.2;
// Evernight Raven, from six constellations: Oz stands 2 seconds longer, and attacks along with every normal attack of the
// Character on the field, 30% of Fischl's ATK as Oz snapshot it, 1U under the Elemental Skill internal cooldown with 10
// Poise. Measured: gcsim v2.47.2 (MIT) fischl/cons.go, and the wiki's advanced properties
// https://genshin-impact.fandom.com/wiki/Evernight_Raven
const EVERNIGHT_RAVEN_CONSTELLATION = 6;
const EVERNIGHT_RAVEN_EXTRA_FRAMES = 120;
const EVERNIGHT_RAVEN_POISE_DAMAGE = 10;
const EVERNIGHT_RAVEN_TALENT_MULTIPLIER = 0.3;

const OZ_SUMMON_ID = "fischl-oz";

// Whether a reaction is Electro-related: one that always holds Electro, or a Swirl or Crystallize of Electro
const checkIsElectroReaction = ({ element, reactionType }: Reaction): boolean =>
  ELECTRO_REACTION_TYPES.has(reactionType) ||
  ((reactionType === ReactionType.Swirl || reactionType === ReactionType.Crystallize) && element === Element.Electro);

// Fischl's Oz once it has spawned, while it stands
const findStandingOz = (effects: readonly KitEffect[], characterId: number): KitSummon | undefined =>
  effects.find(
    (effect): effect is KitSummon =>
      effect.kind === "summon" &&
      effect.id === OZ_SUMMON_ID &&
      effect.combatant.characterId === characterId &&
      effect.elapsedSeconds >= (effect.spawnSeconds ?? 0),
  );

// A normal attack is one arrow, Physical, with its hitmark and its cancel, as gcsim gives each of the five
const createArrow = (
  talentMultiplierMap: TalentMultiplierMap,
  { cancelFrames, hitmarkFrames }: (typeof ARROW_FRAMES)[number],
  index: number,
): KitAction => ({
  hits: [
    {
      hitArea: ARROW_HIT_AREA,
      hitmarkSeconds: hitmarkFrames / 60,
      poiseDamage: ARROW_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_ATTACK_GROUP_ID, TALENT_START_LEVEL, index),
    },
  ],
  seconds: cancelFrames / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

// Fischl's first kit, at talent level 1: five arrows, a fully charged aimed shot, a collision and two plunges, Oz's summon
// And attacks, and Midnight Phantasmagoria with the full Oz it spawns, or the Oz a swap spawns early. One Oz stands at a
// Time, a new one ending the one standing. Undone Be Thy Sinful Hex and the constellations answer the kit's events. Its
// Multipliers are read from her proud skill groups. Stellar Predator and the skill's recast are not built
export const createFischlKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const ozAttackTalentMultiplier = getTalentMultiplier(
    talentMultiplierMap,
    FISCHL_SKILL_GROUP_ID,
    TALENT_START_LEVEL,
    0,
  );
  const ozSummonHit: KitHit = {
    element: Element.Electro,
    gauge: 1,
    hitArea: OZ_SUMMON_HIT_AREA,
    hitmarkSeconds: OZ_SUMMON_HITMARK_FRAMES / 60,
    poiseDamage: OZ_SUMMON_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  };
  const devourerOfAllSinsHit: KitHit = {
    ...ozSummonHit,
    hitArea: DEVOURER_OF_ALL_SINS_HIT_AREA,
    talentMultiplier: ozSummonHit.talentMultiplier + DEVOURER_OF_ALL_SINS_TALENT_MULTIPLIER,
  };
  const midnightPhantasmagoria: KitHit = {
    element: Element.Electro,
    gauge: 2,
    hitArea: BURST_HIT_AREA,
    hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: MIDNIGHT_PHANTASMAGORIA_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  // Oz's attacks from its spawn at the frame given: one every 59 frames, each 10 frames after its tick, while Oz stands
  const createOzAttackHits = (spawnFrames: number, firstTickFrames: number, durationFrames: number): KitHit[] =>
    Array.from({ length: Math.ceil((durationFrames - firstTickFrames) / OZ_TICK_INTERVAL_FRAMES) }, (_tick, index) => ({
      element: Element.Electro,
      gauge: 1,
      hitArea: OZ_ATTACK_HIT_AREA,
      hitmarkSeconds: (spawnFrames + firstTickFrames + index * OZ_TICK_INTERVAL_FRAMES + ARROW_TRAVEL_FRAMES) / 60,
      internalCooldownTag: InternalCooldownTag.ElementalSkill,
      poiseDamage: OZ_POISE_DAMAGE,
      talentMultiplier: ozAttackTalentMultiplier,
    }));
  // Oz cast where the body stands, spawning at the frame given and landing the hits given before its attacks. It ends
  // The Oz standing, and stands 2 seconds longer from six constellations
  const castOz = (
    body: KitBody,
    combatant: Combatant,
    kitEffectState: KitEffectState,
    { firstTickFrames, hits, spawnFrames }: { firstTickFrames: number; hits: KitHit[]; spawnFrames: number },
  ): void => {
    for (const effect of kitEffectState.effects)
      if (effect.kind === "summon" && effect.id === OZ_SUMMON_ID) effect.secondsRemaining = 0;
    const durationFrames =
      OZ_DURATION_FRAMES +
      (combatant.constellationCount >= EVERNIGHT_RAVEN_CONSTELLATION ? EVERNIGHT_RAVEN_EXTRA_FRAMES : 0);
    addKitEffect(kitEffectState, {
      ...createKitSummon(body, combatant, [
        ...hits,
        ...createOzAttackHits(spawnFrames, firstTickFrames, durationFrames),
      ]),
      id: OZ_SUMMON_ID,
      spawnSeconds: spawnFrames / 60,
    });
  };

  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, FISCHL_BURST_GROUP_ID, TALENT_START_LEVEL, 4),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, FISCHL_BURST_GROUP_ID, TALENT_START_LEVEL, 5),
    // The wiki's fully charged aimed shot deals 1U of Electro, as gcsim's Durability 25 gives it, under the Charged Attack
    // Internal cooldown. A bow's aimed shot costs no stamina, as Amber's does not
    chargedAttack: {
      hits: [
        {
          element: Element.Electro,
          gauge: 1,
          hitArea: ARROW_HIT_AREA,
          hitmarkSeconds: FULL_AIM_HITMARK_FRAMES / 60,
          internalCooldownTag: InternalCooldownTag.ChargedAttack,
          poiseDamage: FULL_AIM_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
        },
      ],
      isAimed: true,
      seconds: FULL_AIM_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    // Midnight Phantasmagoria's hit lands on the body, and Oz spawns at 113 frames from the cast and attacks from there.
    // From four constellations its extra hit lands round the body first, and a frame after Oz spawns she heals
    elementalBurst: {
      hits: [midnightPhantasmagoria],
      onStart: ({ body, combatant, kitEffectState }) => {
        castOz(body, combatant, kitEffectState, {
          firstTickFrames: BURST_OZ_FIRST_TICK_FRAMES,
          hits: [],
          spawnFrames: BURST_OZ_SPAWN_FRAMES,
        });
        if (combatant.constellationCount < HER_PILGRIMAGE_OF_BLEAK_CONSTELLATION) return;
        addKitEffect(kitEffectState, createKitSummon(body, combatant, [HER_PILGRIMAGE_OF_BLEAK_HIT]));
        const healSeconds = (BURST_OZ_SPAWN_FRAMES + 1) / 60;
        addKitEffect(kitEffectState, {
          centre: { x: body.position.x, z: body.position.z },
          characterId: combatant.characterId,
          kind: "field",
          nextTickSeconds: healSeconds,
          onTick: ({ party }) => healPartyMember(party, combatant.characterId, HER_PILGRIMAGE_OF_BLEAK_HEALTH_SHARE),
          radius: UNBOUNDED_FIELD_RADIUS,
          // The field lives a tenth of a second past its tick, so the step that runs it still has it
          secondsRemaining: healSeconds + 0.1,
          tickIndex: 0,
          tickIntervalSeconds: Number.POSITIVE_INFINITY,
        });
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    // Oz spawns at 18 frames from the press, lands its summon's hit at 38 and attacks from its first tick
    elementalSkill: {
      hits: [],
      onStart: ({ body, combatant, kitEffectState }) =>
        castOz(body, combatant, kitEffectState, {
          firstTickFrames: OZ_FIRST_TICK_FRAMES,
          hits: [
            combatant.constellationCount >= DEVOURER_OF_ALL_SINS_CONSTELLATION ? devourerOfAllSinsHit : ozSummonHit,
          ],
          spawnFrames: OZ_SPAWN_FRAMES,
        }),
      seconds: SKILL_SECONDS,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: HIGH_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: LOW_PLUNGE_HIT_AREA,
          hitmarkSeconds: 0,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
        },
      ],
      seconds: 0.4,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks: ARROW_FRAMES.map((frames, index) => createArrow(talentMultiplierMap, frames, index)),
    onKitEvent: (event, { activeCombatant, body, combatant, kitEffectState }) => {
      const { ascension, characterId, constellationCount } = combatant;
      const { effects } = kitEffectState;
      // A swap during the burst spawns its Oz at once rather than at the full Oz's frame
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (event.previousCharacterId !== characterId) return;
        const pendingOz = effects.find(
          (effect): effect is KitSummon =>
            effect.kind === "summon" &&
            effect.id === OZ_SUMMON_ID &&
            effect.spawnSeconds === BURST_OZ_SPAWN_FRAMES / 60 &&
            effect.elapsedSeconds < effect.spawnSeconds,
        );
        if (pendingOz)
          castOz(pendingOz.body, pendingOz.combatant, kitEffectState, {
            firstTickFrames: BURST_SHORT_OZ_FIRST_TICK_FRAMES,
            hits: [],
            spawnFrames: BURST_SHORT_OZ_SPAWN_FRAMES,
          });
      } else if (event.kind === KitEventKind.ReactionTriggered) {
        const { enemy, reactions, striker } = event;
        const activeCharacterId = activeCombatant.characterId;
        if (
          ascension < UNDONE_BE_THY_SINFUL_HEX_ASCENSION ||
          striker.characterId !== activeCharacterId ||
          !reactions.some((reaction) => checkIsElectroReaction(reaction)) ||
          checkHasKitStatus(effects, activeCharacterId, THUNDERING_RETRIBUTION_COOLDOWN_STATUS_ID)
        )
          return;
        const oz = findStandingOz(effects, characterId);
        if (!oz) return;
        addKitEffect(kitEffectState, {
          characterId: activeCharacterId,
          id: THUNDERING_RETRIBUTION_COOLDOWN_STATUS_ID,
          kind: "status",
          secondsRemaining: THUNDERING_RETRIBUTION_COOLDOWN_SECONDS,
        });
        addKitEffect(
          kitEffectState,
          createKitSummon({ facing: 0, height: 0, position: enemy.position }, oz.combatant, [
            THUNDERING_RETRIBUTION_HIT,
          ]),
        );
      } else if (event.kind === KitEventKind.NormalAttackLanded) {
        const oz = findStandingOz(effects, characterId);
        const [normalAttackHit] = event.action.hits;
        if (oz && normalAttackHit && constellationCount >= EVERNIGHT_RAVEN_CONSTELLATION)
          addKitEffect(
            kitEffectState,
            createKitSummon(body, oz.combatant, [
              {
                element: Element.Electro,
                gauge: 1,
                hitArea: normalAttackHit.hitArea,
                hitmarkSeconds: ARROW_TRAVEL_FRAMES / 60,
                internalCooldownTag: InternalCooldownTag.ElementalSkill,
                poiseDamage: EVERNIGHT_RAVEN_POISE_DAMAGE,
                talentMultiplier: EVERNIGHT_RAVEN_TALENT_MULTIPLIER,
              },
            ]),
          );
        else if (
          !oz &&
          activeCombatant.characterId === characterId &&
          constellationCount >= GAZE_OF_THE_DEEP_CONSTELLATION
        )
          addKitEffect(kitEffectState, createKitSummon(body, combatant, [GAZE_OF_THE_DEEP_HIT]));
      }
    },
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, FISCHL_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, FISCHL_SKILL_GROUP_ID, TALENT_START_LEVEL, 4),
  };
};
