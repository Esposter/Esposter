import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import {
  MELEE_WEAPON_TYPES,
  SKILL_TARGETING_AREA,
  STRIKE_TARGETING_AREA,
  UNBOUNDED_FIELD_RADIUS,
} from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createFanReach } from "#src/services/kit/createFanReach";
import { createMaxHealthScaledBonus } from "#src/services/kit/createMaxHealthScaledBonus";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { createKitSummon } from "#src/services/kit/effects/createKitSummon";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";

// Candace's proud skill groups, read at her talent level. The attack group holds her strikes' two hits of the third at 2 and
// 3, the first, second and fourth at 0, 1 and 4, the charged attack at 5 and its stamina at 6, and the plunges' collision, low
// And high at 7, 8 and 9. The skill group holds Sacred Rite: Heron's Sanctum's shield share of Max HP at 0, its flat HP at 1,
// The tap's share of Max HP at 2, the charged hit's at 3, the tap's cooldown at 4 and the charged cooldown at 5. The burst group
// Holds Sacred Rite: Wagtail's Tide's share of Max HP at 0, its seconds at 1, its normal attack DMG Bonus at 2, the wave's
// Share at 3, the waves at 4, its cooldown at 5 and its energy cost at 6
const CANDACE_ATTACK_GROUP_ID = 7231;
const CANDACE_SKILL_GROUP_ID = 7232;
const CANDACE_BURST_GROUP_ID = 7239;

// Measured: gcsim (MIT) candace/attack.go, each strike's hitmarks, its default cancel frame, its reach and its poise. The
// First strike is a circle with its offset behind the body, the second a box, the third a fan of 270 degrees ahead whose two
// Hits both reach it, and the fourth a spear's box
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/candace
const FIRST_STRIKE_HIT_AREA = createCircleReach(-0.3, 2.5);
const SECOND_STRIKE_HIT_AREA = createBoxReach(-0.1, 2.2, 3);
// The fan is centred 0.3 metres ahead, so it is priced as that offset plus its radius at its angle
const THIRD_STRIKE_HIT_AREA = createFanReach(270, 0.3 + 2.5);
const FOURTH_STRIKE_HIT_AREA = createBoxReach(-0.1, 2.2, 7);

// Measured: gcsim (MIT) candace/charge.go, the charged attack's circle of radius 0.8 round its primary target at 25 frames, with
// Its animation at 53 frames
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/candace
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 0.8);

// Measured: gcsim (MIT) candace/plunge.go, the collision's circle a metre ahead of radius 1 at 36 frames, and the low and high
// Plunges' circles a metre ahead of radius 3 and 5, at 42 and 45 frames with their animations at 81 and 82, and poise of 100
// And 150
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/candace
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(1, 1);
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);

// Measured: gcsim (MIT) candace/skill.go, the tap's box of 3 by 4.5 metres, offset 0.1 behind the body, struck at 16 frames with
// Its animation at 26, and the charged hit's circle of radius 4 a third of a metre ahead, struck at 91 frames with its animation
// At 113. Both are blunt with 150 and 300 poise, and each sets its shield going until its hit lands
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/candace
const TAP_HIT_AREA = createBoxReach(-0.1, 3, 4.5);
const TAP_FRAMES = 26;
const TAP_HITMARK_FRAMES = 16;
const TAP_POISE_DAMAGE = 150;
const CHARGED_HIT_AREA = createCircleReach(0.3, 4);
const CHARGED_FRAMES = 113;
const CHARGED_HITMARK_FRAMES = 91;
const CHARGED_POISE_DAMAGE = 300;
// The hold's threshold is the framework's half second, as no table or wiki figure gives it and gcsim's hold is a parameter
const HOLD_MINIMUM_HELD_SECONDS = 0.5;

// Measured: gcsim (MIT) candace/burst.go, Sacred Rite: Wagtail's Tide's animation at 51 frames and its initial hit, a circle of
// Radius 3.5 round the body, at 33. The Prayer of the Crimson Crown is set going at that hitmark, and its waves follow each
// Swap at one frame, a circle of the same radius, while it holds
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/candace
const BURST_FRAMES = 51;
const BURST_HITMARK_FRAMES = 33;
const BURST_AREA_RADIUS = 3.5;
const WAVE_HITMARK_FRAMES = 1;
// The Prayer's infusion is struck on each 30 frames, and each infusion lasts 60 frames, as gcsim's AddWeaponInfuse gives them
const PRAYER_TICK_FRAMES = 30;
const INFUSION_SECONDS = 1;
const PRAYER_FIELD_ID = "candace-prayer";
const WAVES_STATUS_ID = "candace-waves";

// Measured: gcsim (MIT) candace/cons.go, Constellation 1 lengthens the Prayer to 12 seconds, three past the table's nine, and
// Constellation 6 sets a wave off for 15% of her Max HP on each elemental normal attack a party member lands, once every 2.3
// Seconds. The table gives both, and the 2.3 seconds read the same from its constellation row
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/candace
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_PRAYER_EXTRA_SECONDS = 3;
const CONSTELLATION_6 = 6;
const CONSTELLATION_6_DAMAGE_SHARE = 0.15;
const CONSTELLATION_6_COOLDOWN_SECONDS = 2.3;
const CONSTELLATION_6_STATUS_ID = "candace-constellation-6";

// Whether the Prayer of the Crimson Crown field stands on a character, the field the burst sets going
const findPrayerField = (effects: readonly KitEffect[], characterId: number): KitField | undefined =>
  effects.find(
    (effect): effect is KitField =>
      effect.kind === "field" && effect.characterId === characterId && effect.id === PRAYER_FIELD_ID,
  );
// The waves the Prayer has unleashed on the character's swaps, as a status of its stacks
const findWavesStatus = (effects: readonly KitEffect[], characterId: number): KitStatus | undefined =>
  effects.find(
    (effect): effect is KitStatus =>
      effect.kind === "status" && effect.characterId === characterId && effect.id === WAVES_STATUS_ID,
  );

// The Prayer's infusion on a party member with a sword, claymore or polearm, as its field's tick and a swap give it
const infuse = (kitEffectState: KitEffectState, { characterId, weaponType }: Combatant): void => {
  if (weaponType === undefined || !MELEE_WEAPON_TYPES.has(weaponType)) return;
  addKitEffect(kitEffectState, {
    characterId,
    element: Element.Hydro,
    kind: "infusion",
    secondsRemaining: INFUSION_SECONDS,
  });
};

// A wave or a Constellation 6 wave, a circle round the body that strikes for a share of the striker's Max HP as flat DMG, which
// Its talent multiplier of zero leaves to the additive base DMG Bonus
const createWaveHit = (share: number): KitHit => ({
  additiveBaseDamageBonus: createMaxHealthScaledBonus(share),
  element: Element.Hydro,
  gauge: 1,
  hitArea: createFanReach(360, BURST_AREA_RADIUS),
  hitmarkSeconds: WAVE_HITMARK_FRAMES / 60,
  poiseDamage: 0,
  talentMultiplier: 0,
});

// Each strike of a normal attack's string, its hits in the order their hitmarks fall
const createStrike = (hits: KitHit[], seconds: number): KitAction => ({
  hits,
  seconds,
  targetingArea: STRIKE_TARGETING_AREA,
});

export const CANDACE_CHARACTER_ID = 10_000_072;

// Candace's first kit, at talent level 1: four strikes, a charged attack, a collision and two plunges, Sacred Rite: Heron's
// Sanctum with its tap and its charged hold, and Sacred Rite: Wagtail's Tide with its initial hit, its Prayer of the Crimson
// Crown and the waves on each swap. Her multipliers are read from her proud skill groups 7231, 7232 and 7239. Constellations 1
// And 6 are built, the sixth's wave on a party member's elemental normal attack. Not built: Ascension 1's instant finish of a
// Charge on a hit taken, which gcsim itself leaves to a TODO; Ascension 4's DMG and the Prayer's 20% DMG Bonus on the team's
// Normal attacks, as no hook reads another member's normal attack's DMG; Constellation 2's Max HP, as a buff on Max HP is not
// Read back into maxHealth; Constellation 4's shorter hold cooldown, as a hold's cooldown is one number on the kit; and the
// Talent levels of Constellations 3 and 5, which no kit reads yet
export const createCandaceKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CANDACE_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CANDACE_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CANDACE_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const burstSeconds = burstMultiplier(1);
  const wavesMax = burstMultiplier(4);
  const waveShare = burstMultiplier(3);
  // Heron's Sanctum's shield, its share of Max HP and its flat HP, which gcsim reads at 0 and 1
  const shieldShare = skillMultiplier(0);
  const shieldFlat = skillMultiplier(1);
  // The tap's share of Max HP is the table's slot 2, which equals the shield's share at every level, where gcsim reads its tap
  // At the shield's slot; the charged hit's is slot 3
  const tapShare = skillMultiplier(2);
  const chargedShare = skillMultiplier(3);

  // The shield is the one Candace casts onto the team, for the seconds until its hit lands, as gcsim sets its shield to expire
  // At the hitmark
  const createShield = (combatant: Combatant, secondsRemaining: number): KitShield => ({
    characterId: combatant.characterId,
    element: Element.Hydro,
    health: shieldFlat + shieldShare * combatant.attributes.maxHealth,
    kind: "shield",
    secondsRemaining,
  });

  const normalAttacks: KitAction[] = [
    createStrike(
      [
        {
          hitArea: FIRST_STRIKE_HIT_AREA,
          hitmarkSeconds: 11 / 60,
          poiseDamage: 60.08,
          talentMultiplier: attackMultiplier(0),
        },
      ],
      32 / 60,
    ),
    createStrike(
      [
        {
          hitArea: SECOND_STRIKE_HIT_AREA,
          hitmarkSeconds: 16 / 60,
          isBlunt: true,
          poiseDamage: 59.76,
          talentMultiplier: attackMultiplier(1),
        },
      ],
      33 / 60,
    ),
    createStrike(
      [
        {
          hitArea: THIRD_STRIKE_HIT_AREA,
          hitmarkSeconds: 16 / 60,
          poiseDamage: 38.08,
          talentMultiplier: attackMultiplier(2),
        },
        {
          hitArea: THIRD_STRIKE_HIT_AREA,
          hitmarkSeconds: 39 / 60,
          poiseDamage: 38.08,
          talentMultiplier: attackMultiplier(3),
        },
      ],
      48 / 60,
    ),
    createStrike(
      [
        {
          hitArea: FOURTH_STRIKE_HIT_AREA,
          hitmarkSeconds: 43 / 60,
          poiseDamage: 94.8,
          talentMultiplier: attackMultiplier(4),
        },
      ],
      69 / 60,
    ),
  ];

  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: 25 / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(5),
      },
    ],
    seconds: 53 / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };

  const createPlunge = (
    hitArea: AttackArea,
    hitmarkFrames: number,
    animationFrames: number,
    poiseDamage: number,
    index: number,
  ): KitAction => ({
    hits: [
      {
        hitArea,
        hitmarkSeconds: hitmarkFrames / 60,
        isBlunt: true,
        poiseDamage,
        talentMultiplier: attackMultiplier(index),
      },
    ],
    seconds: animationFrames / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  });

  // Heron's Sanctum's tap and charged hits deal their share of Max HP as flat DMG, which the additive base DMG Bonus carries
  const elementalSkill: KitAction = {
    hits: [
      {
        additiveBaseDamageBonus: createMaxHealthScaledBonus(tapShare),
        element: Element.Hydro,
        gauge: 1,
        hitArea: TAP_HIT_AREA,
        hitmarkSeconds: TAP_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: TAP_POISE_DAMAGE,
        talentMultiplier: 0,
      },
    ],
    onStart: ({ activeCombatant: combatant, kitEffectState }) =>
      addKitEffect(kitEffectState, createShield(combatant, TAP_HITMARK_FRAMES / 60)),
    seconds: TAP_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const elementalSkillHold: KitAction = {
    hits: [
      {
        additiveBaseDamageBonus: createMaxHealthScaledBonus(chargedShare),
        element: Element.Hydro,
        gauge: 1,
        hitArea: CHARGED_HIT_AREA,
        hitmarkSeconds: CHARGED_HITMARK_FRAMES / 60,
        isBlunt: true,
        poiseDamage: CHARGED_POISE_DAMAGE,
        talentMultiplier: 0,
      },
    ],
    onStart: ({ activeCombatant: combatant, kitEffectState }) =>
      addKitEffect(kitEffectState, createShield(combatant, CHARGED_HITMARK_FRAMES / 60)),
    seconds: CHARGED_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // Sacred Rite: Wagtail's Tide's initial hit, its Prayer of the Crimson Crown and the waves that set off on each swap while it
  // Holds: the Prayer's field infuses the character on the field each 30 frames, from the hitmark, and a swap infuses the one
  // Coming on, and the wave count is a status, restarted by each burst
  const elementalBurst: KitAction = {
    hits: [
      {
        additiveBaseDamageBonus: createMaxHealthScaledBonus(burstMultiplier(0)),
        element: Element.Hydro,
        gauge: 1,
        hitArea: createFanReach(360, BURST_AREA_RADIUS),
        hitmarkSeconds: BURST_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: 0,
      },
    ],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
      const { characterId, constellationCount } = combatant;
      const prayerSeconds =
        BURST_HITMARK_FRAMES / 60 +
        burstSeconds +
        (constellationCount >= CONSTELLATION_1 ? CONSTELLATION_1_PRAYER_EXTRA_SECONDS : 0);
      // A recast burst ends the Prayer it finds standing, as gcsim restarts its status
      const standingPrayer = findPrayerField(kitEffectState.effects, characterId);
      if (standingPrayer) standingPrayer.secondsRemaining = 0;
      addKitEffect(kitEffectState, {
        centre: { x: body.position.x, z: body.position.z },
        characterId,
        id: PRAYER_FIELD_ID,
        kind: "field",
        nextTickSeconds: BURST_HITMARK_FRAMES / 60,
        onTick: ({ activeCombatant, kitEffectState: tickEffectState }) => infuse(tickEffectState, activeCombatant),
        radius: UNBOUNDED_FIELD_RADIUS,
        secondsRemaining: prayerSeconds,
        tickIndex: 0,
        tickIntervalSeconds: PRAYER_TICK_FRAMES / 60,
      });
      addKitEffect(kitEffectState, {
        characterId,
        id: WAVES_STATUS_ID,
        kind: "status",
        secondsRemaining: prayerSeconds,
        stacks: 0,
      });
    },
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  return {
    burstCooldownSeconds: burstMultiplier(5),
    burstEnergyCost: burstMultiplier(6),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(6),
    elementalBurst,
    elementalSkill,
    elementalSkillHolds: [
      {
        action: elementalSkillHold,
        cooldownSeconds: skillMultiplier(5),
        minimumHeldSeconds: HOLD_MINIMUM_HELD_SECONDS,
      },
    ],
    highPlunge: createPlunge(HIGH_PLUNGE_HIT_AREA, 45, 82, 150, 9),
    lowPlunge: createPlunge(LOW_PLUNGE_HIT_AREA, 42, 81, 100, 8),
    normalAttacks,
    // Each swap while the Prayer stands infuses the one coming on and sets a wave off round the body, up to the waves' count.
    // Constellation 6 sets a wave off when a party member's elemental normal attack strikes an enemy, once per cooldown
    onKitEvent: (event, { activeCombatant, body, characterIdCombatantMap, kitEffectState }, combatant) => {
      const { characterId, constellationCount } = combatant;
      const { effects } = kitEffectState;
      if (!findPrayerField(effects, characterId)) return;
      if (event.kind === KitEventKind.CharacterSwapped) {
        const incoming = characterIdCombatantMap.get(event.characterId);
        if (incoming) infuse(kitEffectState, incoming);
        const waves = findWavesStatus(effects, characterId);
        if (!waves || (waves.stacks ?? 0) >= wavesMax) return;
        addKitEffect(kitEffectState, {
          characterId,
          id: WAVES_STATUS_ID,
          kind: "status",
          secondsRemaining: waves.secondsRemaining,
          stacks: (waves.stacks ?? 0) + 1,
        });
        addKitEffect(kitEffectState, createKitSummon(body, combatant, [createWaveHit(waveShare)]));
        return;
      }
      if (
        event.kind === KitEventKind.DamageTaken &&
        constellationCount >= CONSTELLATION_6 &&
        event.attackTag === AttackTag.NormalAttack &&
        event.striker.characterId !== characterId &&
        event.striker.characterId === activeCombatant.characterId &&
        getKitHitElement(event.hit, event.striker) !== undefined &&
        !checkHasKitStatus(effects, characterId, CONSTELLATION_6_STATUS_ID)
      ) {
        addKitEffect(kitEffectState, {
          characterId,
          id: CONSTELLATION_6_STATUS_ID,
          kind: "status",
          secondsRemaining: CONSTELLATION_6_COOLDOWN_SECONDS,
        });
        addKitEffect(kitEffectState, createKitSummon(body, combatant, [createWaveHit(CONSTELLATION_6_DAMAGE_SHARE)]));
      }
    },
    plungeCollision: {
      hitArea: PLUNGE_COLLISION_HIT_AREA,
      hitmarkSeconds: 36 / 60,
      poiseDamage: 0,
      talentMultiplier: attackMultiplier(7),
    },
    skillCooldownSeconds: skillMultiplier(4),
  };
};
