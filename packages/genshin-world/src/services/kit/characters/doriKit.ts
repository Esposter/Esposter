import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";

import { InternalCooldownTag } from "#src/models/combat/InternalCooldownTag";
import { Element } from "#src/models/Element";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { PLUNGE_HIT_AREAS, SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createAheadBody } from "#src/services/kit/createAheadBody";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Dori's proud skill groups, read at her talent level. The attack group holds her three strikes at 0, 1 and 2, the second
// Strike's two hits at 1 and 2, the charged attack's spin at 4 and its final hit at 5, its stamina per second at 6 and its
// Maximum duration at 7, and the plunges' collision, low and high at 8, 9 and 10. The skill group holds Troubleshooter Shot
// At 0, After-Sales Service Round at 1 and its cooldown at 2. The burst group holds Connector at 0, its heal's share and flat
// Heal at 1 and 2, its energy regeneration at 3, its duration at 4, its cooldown at 5 and its energy cost at 6
const DORI_ATTACK_GROUP_ID = 6831;
const DORI_SKILL_GROUP_ID = 6832;
const DORI_BURST_GROUP_ID = 6839;

// Measured: gcsim v2.47.2 (MIT) dori/attack.go, each strike's hitmarks and the frames its action cancels at, the strikes'
// Poise damage, and each hit's cylinder, a circle of radius 2 round the body. The offsets gcsim gives each strike's circle
// Forward of the body are not applied, as a kit's hits reach from the body
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/dori/attack.go
const STRIKE_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 2 });
const NORMAL_ATTACK_FRAMES = [
  { cancelFrames: 44, hitmarkFramesList: [27], poiseDamageList: [95.22] },
  { cancelFrames: 46, hitmarkFramesList: [19, 33], poiseDamageList: [46.5175, 46.5175] },
  { cancelFrames: 108, hitmarkFramesList: [60], poiseDamageList: [127.42] },
];

// Measured: gcsim v2.47.2 (MIT) dori/skill.go, Troubleshooter Shot's hit at 26 frames, 16 for its release and 10 for its
// Travel, a circle of radius 1 on the primary target, with the animation at 44 frames. Its After-Sales Service Round is
// Two hits, 46 and 59 frames after it lands, each a circle of radius 1 on the primary target
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/dori/skill.go
const SKILL_FRAMES = 44;
const TROUBLESHOOTER_SHOT_HITMARK_FRAMES = 16 + 10;
const AFTER_SALES_HITMARK_FRAMES = [46, 59];
const SKILL_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });

// Measured: gcsim v2.47.2 (MIT) dori/burst.go, Alcazarzaray's Exactitude's animation at 58 frames, its 32 Connector ticks
// Every 24 frames from 28 frames, each reaching the enemies in a circle of radius 10 five metres ahead of the body. The
// Ticks run to the last at 772 frames, past the table's 12 seconds, as gcsim runs them. The Connector's box is priced as a
// Circle of radius 1 round the spot the ticks are centred at, since no circle gives its length
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/dori/burst.go
const BURST_FRAMES = 58;
const CONNECTOR_FIRST_TICK_FRAMES = 28;
const CONNECTOR_TICK_INTERVAL_FRAMES = 24;
const CONNECTOR_TICK_COUNT = 32;
const CONNECTOR_LAST_TICK_FRAMES =
  CONNECTOR_FIRST_TICK_FRAMES + CONNECTOR_TICK_INTERVAL_FRAMES * (CONNECTOR_TICK_COUNT - 1);
const CONNECTOR_FIELD_RADIUS = 10;
const CONNECTOR_AHEAD_METRES = 5;
const CONNECTOR_HIT_AREA: AttackArea = Object.freeze({ angle: 2 * Math.PI, height: 2, radius: 1 });

// Provisional: gcsim gives no charged attack for Dori, so its spin lands at the start and its final hit at the table's
// Maximum duration, which the stamina per second drains through. A recording of the attack settles both
const CHARGED_SPIN_HITMARK_SECONDS = 0;

// Measured: gcsim v2.47.2 (MIT) dori/plunge.go, the low plunge's hitmark at 38 frames with 77 frames of animation and poise
// 150, the high plunge's at 40 with 80 and 200, each on the radius of the borrowed plunge areas
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/dori/plunge.go
const LOW_PLUNGE_HITMARK_FRAMES = 38;
const HIGH_PLUNGE_HITMARK_FRAMES = 40;
const LOW_PLUNGE_FRAMES = 77;
const HIGH_PLUNGE_FRAMES = 80;
const LOW_PLUNGE_POISE_DAMAGE = 150;
const HIGH_PLUNGE_POISE_DAMAGE = 200;

// Provisional: gcsim gives Dori's skill and burst and her collision no poise, so they stand at 0 and the collision at
// Bennett's 25, the plunge collision borrowed as Bennett's kit prices it, until a source gives them
const PLUNGE_COLLISION_POISE_DAMAGE = 25;
const NO_POISE_DAMAGE = 0;

export const DORI_CHARACTER_ID = 10_000_068;

// Dori's first kit, at talent level 1: her three strikes, a charged attack, a collision and two plunges, Troubleshooter
// Shot with its After-Sales Service Round, and Alcazarzaray's Exactitude with its Connector ticks. Her healing, energy
// Regeneration, self-infusion and passives are not built: the healing and energy wait on a field that heals on its own
// Clock, and the self-infusion and the passives wait on hooks the kit does not yet offer
export const createDoriKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const createNormalAttack = (
    { cancelFrames, hitmarkFramesList, poiseDamageList }: (typeof NORMAL_ATTACK_FRAMES)[number],
    index: number,
  ): KitAction => ({
    hits: hitmarkFramesList.map((hitmarkFrames, hitIndex) => ({
      hitArea: STRIKE_HIT_AREA,
      hitmarkSeconds: hitmarkFrames / 60,
      internalCooldownTag: InternalCooldownTag.NormalAttack,
      isBlunt: true,
      poiseDamage: poiseDamageList[hitIndex] ?? NO_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(
        talentMultiplierMap,
        DORI_ATTACK_GROUP_ID,
        TALENT_START_LEVEL,
        index === 1 ? 1 + hitIndex : index === 2 ? 3 : 0,
      ),
    })),
    seconds: cancelFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });
  const troubleshooterHit: KitHit = {
    element: Element.Electro,
    gauge: 1,
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: TROUBLESHOOTER_SHOT_HITMARK_FRAMES / 60,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, DORI_SKILL_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  const afterSalesHits: KitHit[] = AFTER_SALES_HITMARK_FRAMES.map((hitmarkFrames) => ({
    element: Element.Electro,
    gauge: 1,
    hitArea: SKILL_HIT_AREA,
    hitmarkSeconds: (TROUBLESHOOTER_SHOT_HITMARK_FRAMES + hitmarkFrames) / 60,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, DORI_SKILL_GROUP_ID, TALENT_START_LEVEL, 1),
  }));
  const connectorHit: KitHit = {
    element: Element.Electro,
    gauge: 1,
    hitArea: CONNECTOR_HIT_AREA,
    hitmarkSeconds: 0,
    internalCooldownTag: InternalCooldownTag.ElementalBurst,
    poiseDamage: NO_POISE_DAMAGE,
    talentMultiplier: getTalentMultiplier(talentMultiplierMap, DORI_BURST_GROUP_ID, TALENT_START_LEVEL, 0),
  };
  return {
    burstCooldownSeconds: getTalentMultiplier(talentMultiplierMap, DORI_BURST_GROUP_ID, TALENT_START_LEVEL, 5),
    burstEnergyCost: getTalentMultiplier(talentMultiplierMap, DORI_BURST_GROUP_ID, TALENT_START_LEVEL, 6),
    chargedAttack: {
      hits: [
        {
          hitArea: STRIKE_HIT_AREA,
          hitmarkSeconds: CHARGED_SPIN_HITMARK_SECONDS,
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, DORI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 4),
        },
        {
          hitArea: STRIKE_HIT_AREA,
          hitmarkSeconds: getTalentMultiplier(talentMultiplierMap, DORI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
          poiseDamage: NO_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, DORI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 5),
        },
      ],
      seconds: getTalentMultiplier(talentMultiplierMap, DORI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 7),
      staminaPerSecond: getTalentMultiplier(talentMultiplierMap, DORI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 6),
      targetingArea: STRIKE_TARGETING_AREA,
    },
    chargedAttackStamina: 0,
    elementalBurst: {
      hits: [],
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        // The connector ticks in the circle five metres ahead of the body, where the burst was cast, and each tick strikes
        // From that spot whatever the body does after
        const spot = createAheadBody(body, CONNECTOR_AHEAD_METRES);
        castKitField(kitEffectState, combatant.characterId, spot.position, {
          nextTickSeconds: CONNECTOR_FIRST_TICK_FRAMES / 60,
          onTick: ({ kitEffectState: tickEffectState }) => {
            castKitSummon(tickEffectState, spot, combatant, [connectorHit]);
          },
          radius: CONNECTOR_FIELD_RADIUS,
          secondsRemaining: (CONNECTOR_LAST_TICK_FRAMES + 1) / 60,
          tickIntervalSeconds: CONNECTOR_TICK_INTERVAL_FRAMES / 60,
        });
      },
      seconds: BURST_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    elementalSkill: {
      // The After-Sales Service Round's two hits follow the first past the skill's end
      hits: [troubleshooterHit, ...afterSalesHits],
      seconds: SKILL_FRAMES / 60,
      targetingArea: SKILL_TARGETING_AREA,
    },
    highPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.high,
          hitmarkSeconds: HIGH_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: HIGH_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, DORI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 10),
        },
      ],
      seconds: HIGH_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    lowPlunge: {
      hits: [
        {
          hitArea: PLUNGE_HIT_AREAS.low,
          hitmarkSeconds: LOW_PLUNGE_HITMARK_FRAMES / 60,
          isBlunt: true,
          poiseDamage: LOW_PLUNGE_POISE_DAMAGE,
          talentMultiplier: getTalentMultiplier(talentMultiplierMap, DORI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 9),
        },
      ],
      seconds: LOW_PLUNGE_FRAMES / 60,
      targetingArea: STRIKE_TARGETING_AREA,
    },
    normalAttacks: NORMAL_ATTACK_FRAMES.map((frames, index) => createNormalAttack(frames, index)),
    plungeCollision: {
      gauge: 0,
      hitArea: PLUNGE_HIT_AREAS.collision,
      hitmarkSeconds: 0,
      poiseDamage: PLUNGE_COLLISION_POISE_DAMAGE,
      talentMultiplier: getTalentMultiplier(talentMultiplierMap, DORI_ATTACK_GROUP_ID, TALENT_START_LEVEL, 8),
    },
    skillCooldownSeconds: getTalentMultiplier(talentMultiplierMap, DORI_SKILL_GROUP_ID, TALENT_START_LEVEL, 2),
  };
};
