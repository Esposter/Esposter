import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { Attribute } from "#src/models/character/Attribute";
import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";

// Kujou Sara's proud skill groups, read at her talent level. The attack group holds the five strikes at 0 to 4, the aimed
// Shot at 5, the fully charged shot at 6 and the plunges' collision, low and high at 7, 8 and 9. The skill group holds
// Tengu Juurai: Ambush's damage at 0, the ATK Bonus ratio at 1, its seconds at 2 and the skill's cooldown at 3. The burst
// Group holds Titanbreaker's damage at 0, Stormcluster's at 1, its cooldown at 2 and its energy cost at 3
const SARA_ATTACK_GROUP_ID = 5631;
const SARA_SKILL_GROUP_ID = 5632;
const SARA_BURST_GROUP_ID = 5639;

// Measured: gcsim v2.47.2 (MIT) sara/attack.go, each strike's hitmark and the frames its action cancels at, its arrow
// Travelling 10 frames to a box on the primary target, priced as a circle of a metre round the body as Ganyu's arrows are
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sara/attack.go
const ARROW_TRAVEL_FRAMES = 10;
const ARROW_HIT_AREA: AttackArea = createCircleReach(0, 1);
const NORMAL_ATTACK_FRAMES = [
  { cancelFrames: 25, hitmarkFrames: 14 },
  { cancelFrames: 28, hitmarkFrames: 13 },
  { cancelFrames: 37, hitmarkFrames: 19 },
  { cancelFrames: 38, hitmarkFrames: 19 },
  { cancelFrames: 45, hitmarkFrames: 32 },
];

// Measured: gcsim v2.47.2 (MIT) sara/aimed.go, the fully charged shot's animation at 96 frames and its arrow at 86, which
// Travels 10 frames to the primary target as the strikes' do
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sara/aimed.go
const FULL_CHARGE_FRAMES = 96;
const FULL_CHARGE_HITMARK_FRAMES = 86 + ARROW_TRAVEL_FRAMES;

// Measured: gcsim v2.47.2 (MIT) sara/aimed.go and skill.go, a fully charged shot with the Crowfeather Cover from Ascension 1
// Drops a crowfeather at its target, which the Ambush strikes at 150 frames as a circle of radius 6 round the target. The
// Cover lasts 18 seconds, and Constellation 2's crowfeather is set out at Sara's own place, struck at 103 frames for 30% of
// Its damage, a circle of radius 6 round her body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sara/skill.go
const COVER_SECONDS = 18;
const AMBUSH_HITMARK_FRAMES = 50 + ARROW_TRAVEL_FRAMES + 90;
const AMBUSH_HIT_AREA: AttackArea = createTargetedHitArea(STRIKE_TARGETING_AREA, 6);
const CONSTELLATION_CROWFEATHER_HITMARK_FRAMES = 103;
const CONSTELLATION_CROWFEATHER_DAMAGE_SHARE = 0.3;
const CONSTELLATION_CROWFEATHER_HIT_AREA: AttackArea = createCircleReach(0, 6);
const SKILL_FRAMES = 52;
const COVER_ID = "sara-crowfeather-cover";

// Measured: gcsim v2.47.2 (MIT) sara/burst.go, Titanbreaker at 51 frames on the primary target, a circle of radius 6, with an
// Animation of 80 frames. Stormcluster is four bouts of six ticks from 100 frames, each tick 18 frames after the last, a
// Circle of radius 3 set out 3.6 metres from the target and 1.35 metres further per tick, in four directions, six from
// Constellation 4
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/sara/burst.go
const BURST_FRAMES = 80;
const TITANBREAKER_HITMARK_FRAMES = 51;
const STORMCLUSTER_RADIUS = 3;
const STORMCLUSTER_START_METRES = 3.6;
const STORMCLUSTER_STEP_METRES = 1.35;
const STORMCLUSTER_FIRST_FRAMES = 100;
const STORMCLUSTER_INTERVAL_FRAMES = 18;
const STORMCLUSTER_TICK_COUNT = 6;
const STORMCLUSTER_DIRECTIONS = 4;
const STORMCLUSTER_DIRECTIONS_WITH_C4 = 6;

// Provisional: gcsim gives the plunges no poise and the arrows none, so these stand at none until the Mac measures them. The
// Plunges' seconds are Ganyu's, until the Mac measures Sara's
const PLUNGE_SECONDS = 0.4;
const TENGU_SOURCE = "sara-tengu-stormcall";
const C2_CONSTELLATION = 2;
const C4_CONSTELLATION = 4;

export const KUJOU_SARA_CHARACTER_ID = 10_000_056;

// Kujou Sara's first kit, at talent level 1: five strikes, a fully charged shot that drops a crowfeather under the Cover, a
// Collision and two plunges, Tengu Stormcall's Cover and crowfeather with its Ambush and Constellation 2's weaker one, and
// Subjugation: Koukou Sendou with Titanbreaker and its Stormclusters, four bouts or six from Constellation 4. Her ATK Bonus
// Is a share of her base ATK, which the combatant carries. Ascension 1's Cover is built, as its shorter charge is not, as a
// Charged attack has one duration. Ascension 4's energy and Constellations 1 and 6 are not built, as no hit reads the party
// Energy or the Electro DMG Bonus they need
export const createKujouSaraKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, SARA_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, SARA_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstTalentMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, SARA_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const atkBonusRatio = skillTalentMultiplier(1);
  const atkBonusSeconds = skillTalentMultiplier(2);

  // The ATK Bonus Tengu Stormcall gives the character on the field as a hit lands, a share of Sara's base ATK
  const addAtkBonus = ({ kitEffectState, party }: KitContext, { combatant }: KitStrike): void =>
    addKitEffect(kitEffectState, {
      amount: atkBonusRatio * combatant.attributes.attributeTotalMap[Attribute.BaseAttack],
      attribute: Attribute.Attack,
      characterId: getActiveCharacterId(party),
      kind: "buff",
      secondsRemaining: atkBonusSeconds,
      source: TENGU_SOURCE,
    });

  const createAmbushHit = (damage: number, area: AttackArea, hitmarkFrames: number): KitHit => ({
    element: Element.Electro,
    gauge: 1,
    hitArea: area,
    hitmarkSeconds: hitmarkFrames / 60,
    onStrike: addAtkBonus,
    poiseDamage: 0,
    talentMultiplier: damage,
  });

  // The crowfeather a fully charged shot drops under the Cover, which the Ambush strikes from its target
  const createAmbushSummon = (body: KitBody, combatant: Combatant): KitSummon =>
    createKitSummon(body, combatant, [
      createAmbushHit(skillTalentMultiplier(0), AMBUSH_HIT_AREA, AMBUSH_HITMARK_FRAMES),
    ]);

  // Subjugation's Stormclusters, each direction's six ticks at 100 frames and on, set out at the cast from the body
  const createStormclusters = (body: KitBody, combatant: Combatant): KitSummon => {
    const directions =
      combatant.constellationCount >= C4_CONSTELLATION ? STORMCLUSTER_DIRECTIONS_WITH_C4 : STORMCLUSTER_DIRECTIONS;
    const ticks = Array.from({ length: STORMCLUSTER_TICK_COUNT }, (_tick, index) => ({
      hitArea: createTargetedHitArea(
        SKILL_TARGETING_AREA,
        STORMCLUSTER_RADIUS + STORMCLUSTER_START_METRES + index * STORMCLUSTER_STEP_METRES,
      ),
      hitmarkSeconds: (STORMCLUSTER_FIRST_FRAMES + index * STORMCLUSTER_INTERVAL_FRAMES) / 60,
    }));
    const hits: KitHit[] = ticks.flatMap(({ hitArea, hitmarkSeconds }) =>
      Array.from({ length: directions }, (): KitHit => ({
        element: Element.Electro,
        gauge: 1,
        hitArea,
        hitmarkSeconds,
        internalCooldownTag: InternalCooldownTag.ElementalBurst,
        onStrike: addAtkBonus,
        poiseDamage: 0,
        talentMultiplier: burstTalentMultiplier(1),
      })),
    );
    return createKitSummon(body, combatant, hits);
  };

  const normalAttacks: KitAction[] = NORMAL_ATTACK_FRAMES.map(({ cancelFrames, hitmarkFrames }, index) => ({
    hits: [
      {
        hitArea: ARROW_HIT_AREA,
        hitmarkSeconds: (hitmarkFrames + ARROW_TRAVEL_FRAMES) / 60,
        poiseDamage: 0,
        talentMultiplier: attackTalentMultiplier(index),
      },
    ],
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  }));

  return {
    burstCooldownSeconds: burstTalentMultiplier(2),
    burstEnergyCost: burstTalentMultiplier(3),
    chargedAttack: {
      hits: [
        {
          element: Element.Electro,
          gauge: 1,
          hitArea: ARROW_HIT_AREA,
          hitmarkSeconds: FULL_CHARGE_HITMARK_FRAMES / 60,
          onStrike: addAtkBonus,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(6),
        },
      ],
      isAimed: true,
      // A fully charged shot under the Cover from Ascension 1 drops the crowfeather and spends the Cover
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        if (combatant.ascension < 1) return;
        const cover = kitEffectState.effects.find(
          (effect): effect is KitStatus =>
            effect.kind === "status" && effect.id === COVER_ID && effect.characterId === combatant.characterId,
        );
        if (cover === undefined || cover.secondsRemaining <= 0) return;
        cover.secondsRemaining = 0;
        addKitEffect(kitEffectState, createAmbushSummon(body, combatant));
      },
      seconds: FULL_CHARGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: [
        {
          element: Element.Electro,
          gauge: 1,
          hitArea: createTargetedHitArea(SKILL_TARGETING_AREA, 6),
          hitmarkSeconds: TITANBREAKER_HITMARK_FRAMES / 60,
          onStrike: addAtkBonus,
          poiseDamage: 0,
          talentMultiplier: burstTalentMultiplier(0),
        },
      ],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) =>
        addKitEffect(kitEffectState, createStormclusters(body, combatant)),
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      hits: [],
      // The Cover lasts 18 seconds, and from Constellation 2 a weaker crowfeather is set out where Sara stands
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const cover: KitStatus = {
          characterId: combatant.characterId,
          id: COVER_ID,
          kind: "status",
          secondsRemaining: COVER_SECONDS,
        };
        addKitEffect(kitEffectState, cover);
        if (combatant.constellationCount >= C2_CONSTELLATION)
          addKitEffect(
            kitEffectState,
            createKitSummon(body, combatant, [
              createAmbushHit(
                CONSTELLATION_CROWFEATHER_DAMAGE_SHARE * skillTalentMultiplier(0),
                CONSTELLATION_CROWFEATHER_HIT_AREA,
                CONSTELLATION_CROWFEATHER_HITMARK_FRAMES,
              ),
            ]),
          );
      },
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 5),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(9),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: createFanReach(360, 3),
          hitmarkSeconds: 0,
          poiseDamage: 0,
          talentMultiplier: attackTalentMultiplier(8),
        },
      ],
      seconds: PLUNGE_SECONDS,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks,
    plungeCollision: {
      hitArea: createFanReach(360, 1),
      hitmarkSeconds: 0,
      poiseDamage: 0,
      talentMultiplier: attackTalentMultiplier(7),
    },
    skillCooldownSeconds: skillTalentMultiplier(3),
  };
};
