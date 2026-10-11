import type { TalentMultiplierMap } from "#src/models/character/TalentMultiplierMap";
import type { Reaction } from "#src/models/combat/Reaction";
import type { AttackArea } from "#src/models/kit/AttackArea";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { TALENT_START_LEVEL } from "#src/services/character/constants";
import { SKILL_TARGETING_AREA, STRIKE_TARGETING_AREA, UNBOUNDED_FIELD_RADIUS } from "#src/services/kit/constants";
import { createBoxReach } from "#src/services/kit/createBoxReach";
import { createCircleReach } from "#src/services/kit/createCircleReach";
import { createTargetedHitArea } from "#src/services/kit/createTargetedHitArea";
import { addKitEffect } from "#src/services/kit/effects/addKitEffect";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkHasKitStatus } from "#src/services/kit/effects/checkHasKitStatus";
import { enterKitStance } from "#src/services/kit/effects/enterKitStance";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getTalentMultiplier } from "#src/services/kit/getTalentMultiplier";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

// Cyno's proud skill groups, read at his talent level. The attack group holds the Invoker's Spear strikes at 0 to 3, the
// Third strike's two hits at 2 and 3, the fourth at 4, the charged attack at 5, the charged attack's stamina at 6, which is
// The one slot gcsim does not read and is a best estimate, and the plunges' collision, low and high at 7, 8 and 9. The skill
// Group holds Secret Rite's DMG at 0, Mortuary Rite's at 1, the burst's extension in seconds at 2, the skill's cooldown at 3
// And Mortuary Rite's cooldown at 4. The burst group holds Pactsworn Pathclearer's strikes at 0 to 5 (the fourth strike's
// Two hits at 3 and 4), its charged attack at 6, the plunges' collision, low and high at 8, 9 and 10, the Elemental
// Mastery it adds at 11, its duration in seconds at 12, its cooldown at 13 and its energy cost at 14. Slot 7 is not read
const CYNO_ATTACK_GROUP_ID = 7131;
const CYNO_SKILL_GROUP_ID = 7132;
const CYNO_BURST_GROUP_ID = 7139;

interface StrikeHitSpec {
  hitArea: AttackArea;
  hitmarkFrames: number;
  index: number;
  isBlunt?: boolean;
  poiseDamage?: number;
}
interface StrikeSpec {
  cancelFrames: number;
  hits: StrikeHitSpec[];
}

// Measured: gcsim (MIT) cyno/attack.go, the Invoker's Spear strikes' hitmarks, the frame each strike's default cancel falls
// On, and their reaches. A circle is its offset plus its radius, and a box is priced to its far corner. gcsim's first strike
// Is a fan of 270 degrees, which a circle prices as a whole circle
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/cyno
const INVOKER_STRIKES: StrikeSpec[] = [
  { cancelFrames: 28, hits: [{ hitArea: createCircleReach(0.5, 1.8), hitmarkFrames: 14, index: 0 }] },
  { cancelFrames: 23, hits: [{ hitArea: createBoxReach(-0.2, 1.8, 2.7), hitmarkFrames: 17, index: 1 }] },
  {
    cancelFrames: 27,
    hits: [
      { hitArea: createBoxReach(0, 2.2, 3.6), hitmarkFrames: 13, index: 2 },
      { hitArea: createBoxReach(0, 2.2, 3.6), hitmarkFrames: 22, index: 3 },
    ],
  },
  { cancelFrames: 58, hits: [{ hitArea: createCircleReach(1, 2.3), hitmarkFrames: 27, index: 4 }] },
];

// Measured: gcsim (MIT) cyno/burst.go and attack.go, Pactsworn Pathclearer's five strikes, each strike's hitmarks, its default
// Cancel and its reach. The third strike is blunt with 64.0248 poise and the fifth with 77.7, as gcsim gives them
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/cyno
const PACTSWORN_STRIKES: StrikeSpec[] = [
  { cancelFrames: 28, hits: [{ hitArea: createCircleReach(1, 2), hitmarkFrames: 12, index: 0 }] },
  { cancelFrames: 35, hits: [{ hitArea: createCircleReach(1, 2), hitmarkFrames: 14, index: 1 }] },
  {
    cancelFrames: 41,
    hits: [{ hitArea: createBoxReach(-0.2, 2.5, 6), hitmarkFrames: 18, index: 2, isBlunt: true, poiseDamage: 64.0248 }],
  },
  {
    cancelFrames: 36,
    hits: [
      { hitArea: createCircleReach(0.8, 2.5), hitmarkFrames: 5, index: 3 },
      { hitArea: createCircleReach(0.8, 2.5), hitmarkFrames: 14, index: 4 },
    ],
  },
  {
    cancelFrames: 62,
    hits: [{ hitArea: createCircleReach(1.5, 3.5), hitmarkFrames: 40, index: 5, isBlunt: true, poiseDamage: 77.7 }],
  },
];

// Measured: gcsim (MIT) cyno/charge.go, the Invoker's charged attack's slash at 24 frames, a circle of radius 0.8 round its
// Primary target with its animation at 63 frames, and Pactsworn's charge at 27 frames and 65
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/cyno
const CHARGED_ATTACK_FRAMES = 63;
const CHARGED_ATTACK_HITMARK_FRAMES = 24;
const PACTSWORN_CHARGED_ATTACK_FRAMES = 65;
const PACTSWORN_CHARGED_ATTACK_HITMARK_FRAMES = 27;
const CHARGED_ATTACK_HIT_AREA = createTargetedHitArea(STRIKE_TARGETING_AREA, 0.8);

// Measured: gcsim (MIT) cyno/plunge.go, the collision at 38 frames, the low plunge at 44 with its animation at 72 and the high
// At 46 with its animation at 75. Each plunge is a circle one metre ahead of the body with its radius of 3 or 5, and the
// Collision a circle of radius 1 there, with the low and high plunges' poise of 100 and 150
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/cyno
const PLUNGE_COLLISION_HITMARK_FRAMES = 38;
const PLUNGE_COLLISION_HIT_AREA = createCircleReach(1, 1);
const LOW_PLUNGE_FRAMES = 72;
const LOW_PLUNGE_HITMARK_FRAMES = 44;
const LOW_PLUNGE_HIT_AREA = createCircleReach(1, 3);
const LOW_PLUNGE_POISE_DAMAGE = 100;
const HIGH_PLUNGE_FRAMES = 75;
const HIGH_PLUNGE_HITMARK_FRAMES = 46;
const HIGH_PLUNGE_HIT_AREA = createCircleReach(1, 5);
const HIGH_PLUNGE_POISE_DAMAGE = 150;

// Measured: gcsim (MIT) cyno/skill.go, Secret Rite: Chasmic Soulfarer's animation at 43 frames and its slash at 21 on the primary
// Target within a circle of radius 1. Mortuary Rite's animation at 34 frames and its blunt slash at 28, a circle of radius 6
// Centred 1.5 metres ahead, with 75 poise. Its cooldown is 3 seconds where Secret Rite's is 7.5
// https://github.com/genshinsim/gcsim/tree/main/internal/characters/cyno
const SKILL_FRAMES = 43;
const SKILL_HITMARK_FRAMES = 21;
const SKILL_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 1);
const MORTUARY_RITE_FRAMES = 34;
const MORTUARY_RITE_HITMARK_FRAMES = 28;
const MORTUARY_RITE_HIT_AREA = createCircleReach(1.5, 6);
const MORTUARY_RITE_POISE_DAMAGE = 75;

// Measured: gcsim (MIT) cyno/burst.go and cyno/skill.go, Sacred Rite: Wolf's Swiftness's animation at 86 frames, its duration of
// The table's 10 seconds plus the 112 frames gcsim adds to it, and each Mortuary Rite that extends it by four seconds, up to two
// Times. The Duststalker Bolts it fires on Judication are three hits each, at gcsim's talent multiplier of 1.0, a targeted
// Circle of radius 0.3, which Judication's ElementalMastery share prices with the passive
const BURST_FRAMES = 86;
const BURST_DURATION_CAST_FRAMES = 112;
const BURST_EXTENSIONS_MAX = 2;
const BURST_EXTENSIONS_STATUS_ID = "cyno-burst-extensions";
const BURST_BUFF_SOURCE = "cyno-burst";
const DUSTSTALKER_BOLT_HIT_AREA = createTargetedHitArea(SKILL_TARGETING_AREA, 0.3);
const DUSTSTALKER_BOLT_TALENT_MULTIPLIER = 1;
const ELEMENTAL_MASTERY_SHARE_ASCENSION_4_NORMAL_ATTACK = 1.5;
const ELEMENTAL_MASTERY_SHARE_ASCENSION_4_BOLT = 2.5;
const ASCENSION_1 = 1;
const ASCENSION_4 = 4;

// Measured: gcsim (MIT) cyno/asc.go, Judication: once Pactsworn Pathclearer has run for 328 frames, Endseer lasts 84 frames and
// Recurs every 234 frames while the burst holds. A Mortuary Rite under Endseer raises its DMG 35%, which the kit cannot price
// (see the page), and fires three Duststalker Bolts
const JUDICATION_FIELD_ID = "cyno-judication";
const ENDSEER_STATUS_ID = "cyno-endseer";
const JUDICATION_FIRST_FRAMES = 328;
const JUDICATION_INTERVAL_FRAMES = 234;
const ENDSEER_FRAMES = 84;
const DUSTSTALKER_BOLT_COUNT = 3;

// Measured: gcsim (MIT) cyno/cons.go, Constellation 2 raises his Electro DMG 10% for four seconds per normal attack that hits, up to
// Five stacks, once every 0.1 seconds. Constellation 4 restores 3 energy to each other member for up to five reactions a burst.
// Constellation 6 gives four stacks of Day of the Jackal, up to eight, which last eight seconds, and each normal attack
// Consumes one to fire a Duststalker Bolt, once every 0.4 seconds
const CONSTELLATION_2 = 2;
const CONSTELLATION_4 = 4;
const CONSTELLATION_6 = 6;
const C2_STATUS_ID = "cyno-c2";
const C2_ICD_STATUS_ID = "cyno-c2-icd";
const C2_SECONDS = 4;
const C2_ICD_SECONDS = 0.1;
const C2_STACKS_MAX = 5;
const C2_ELECTRO_DAMAGE_BONUS_PER_STACK = 0.1;
const C4_STATUS_ID = "cyno-c4";
const C4_STACKS_MAX = 5;
const C4_ENERGY = 3;
const C4_REACTION_TYPES: ReadonlySet<ReactionType> = new Set([
  ReactionType.Aggravate,
  ReactionType.ElectroCharged,
  ReactionType.Hyperbloom,
  ReactionType.Overloaded,
  ReactionType.Quicken,
  ReactionType.Superconduct,
]);
const C6_STATUS_ID = "cyno-c6";
const C6_ICD_STATUS_ID = "cyno-c6-icd";
const C6_SECONDS = 8;
const C6_ICD_SECONDS = 0.4;
const C6_STACKS_PER_TRIGGER = 4;
const C6_STACKS_MAX = 8;

// Pactsworn's normal attacks and Duststalker Bolts take 150% and 250% of his Elemental Mastery as flat DMG from Ascension 4
const pactswornNormalAttackBonus = (combatant: Combatant): number =>
  combatant.ascension >= ASCENSION_4
    ? combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] *
      ELEMENTAL_MASTERY_SHARE_ASCENSION_4_NORMAL_ATTACK
    : 0;

const createDuststalkerBoltHit = (hitmarkSeconds: number): KitHit => ({
  additiveBaseDamageBonus: (combatant) =>
    combatant.ascension >= ASCENSION_4
      ? combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] * ELEMENTAL_MASTERY_SHARE_ASCENSION_4_BOLT
      : 0,
  element: Element.Electro,
  gauge: 1,
  hitArea: DUSTSTALKER_BOLT_HIT_AREA,
  hitmarkSeconds,
  poiseDamage: 0,
  talentMultiplier: DUSTSTALKER_BOLT_TALENT_MULTIPLIER,
});

// Day of the Jackal's stacks are set to four at the burst and raised by four at each Judication, to eight at most
const addDayOfTheJackal = (kitEffectState: KitEffectState, characterId: number, stacks: number): void =>
  addKitEffect(kitEffectState, { characterId, id: C6_STATUS_ID, kind: "status", secondsRemaining: C6_SECONDS, stacks });

// Constellation 2's Electro DMG bonus and Constellation 6's bolts are struck by each normal attack that hits an enemy, the
// Constellation 2 stacks rising once every 0.1 seconds and Constellation 6's bolt once every 0.4, both only in Pactsworn
const onNormalAttackStrike = ({ kitEffectState }: KitContext, { body, combatant }: KitStrike): void => {
  const { characterId, constellationCount } = combatant;
  if (
    constellationCount >= CONSTELLATION_2 &&
    !checkHasKitStatus(kitEffectState.effects, characterId, C2_ICD_STATUS_ID)
  ) {
    addKitEffect(kitEffectState, {
      characterId,
      id: C2_ICD_STATUS_ID,
      kind: "status",
      secondsRemaining: C2_ICD_SECONDS,
    });
    const stacks = Math.min(
      C2_STACKS_MAX,
      (findKitStatus(kitEffectState.effects, characterId, C2_STATUS_ID)?.stacks ?? 0) + 1,
    );
    addKitEffect(kitEffectState, {
      characterId,
      id: C2_STATUS_ID,
      kind: "status",
      secondsRemaining: C2_SECONDS,
      stacks,
    });
    addKitEffect(kitEffectState, {
      amount: C2_ELECTRO_DAMAGE_BONUS_PER_STACK * stacks,
      attribute: Attribute.ElectroDamageBonus,
      characterId,
      kind: "buff",
      secondsRemaining: C2_SECONDS,
      source: C2_STATUS_ID,
    });
  }
  if (
    constellationCount >= CONSTELLATION_6 &&
    findKitStance(kitEffectState.effects, characterId) &&
    !checkHasKitStatus(kitEffectState.effects, characterId, C6_ICD_STATUS_ID)
  ) {
    const day = findKitStatus(kitEffectState.effects, characterId, C6_STATUS_ID);
    if (day && (day.stacks ?? 0) > 0) {
      day.stacks = (day.stacks ?? 0) - 1;
      addKitEffect(kitEffectState, {
        characterId,
        id: C6_ICD_STATUS_ID,
        kind: "status",
        secondsRemaining: C6_ICD_SECONDS,
      });
      castKitSummon(kitEffectState, body, combatant, [createDuststalkerBoltHit(0)]);
    }
  }
};

// Each strike's hits take the talent multiplier of their own index, and the strike's own extras, which Pactsworn's strikes
// Use for their element and their Ascension 4 flat DMG
const createStrikeAction = (
  { cancelFrames, hits }: StrikeSpec,
  multiplierOf: (index: number) => number,
  extra: Partial<KitHit>,
): KitAction => ({
  hits: hits.map(({ hitArea, hitmarkFrames, index, isBlunt = false, poiseDamage = 0 }): KitHit => ({
    ...extra,
    ...(isBlunt && { isBlunt: true as const }),
    hitArea,
    hitmarkSeconds: hitmarkFrames / 60,
    onStrike: onNormalAttackStrike,
    poiseDamage,
    talentMultiplier: multiplierOf(index),
  })),
  seconds: cancelFrames / 60,
  targetingArea: STRIKE_TARGETING_AREA,
});

// The Judication field a character holds
const findJudicationField = (effects: readonly KitEffect[], characterId: number): KitField | undefined =>
  effects.find(
    (effect): effect is KitField =>
      effect.kind === "field" && effect.characterId === characterId && effect.id === JUDICATION_FIELD_ID,
  );
const checkIsC4Reaction = ({ element, reactionType }: Reaction): boolean =>
  C4_REACTION_TYPES.has(reactionType) || (reactionType === ReactionType.Swirl && element === Element.Electro);

export const CYNO_CHARACTER_ID = 10_000_071;

// Cyno's kit: the Invoker's Spear with its charged attack, plunges and collision, Secret Rite: Chasmic Soulfarer, and Sacred
// Rite: Wolf's Swiftness, which sets Pactsworn Pathclearer on the team as a stance with its own strikes, charged attack and
// Skill, Mortuary Rite, and its Elemental Mastery and Judication. Ascension 1 and 4, and Constellations 2, 4 and 6 are built.
// Constellation 1's attack speed and the plunges of Pactsworn Pathclearer are not, as the kit has no hook for either
export const createCynoKit = (talentMultiplierMap: TalentMultiplierMap): Kit => {
  const attackMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CYNO_ATTACK_GROUP_ID, TALENT_START_LEVEL, index);
  const skillMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CYNO_SKILL_GROUP_ID, TALENT_START_LEVEL, index);
  const burstMultiplier = (index: number): number =>
    getTalentMultiplier(talentMultiplierMap, CYNO_BURST_GROUP_ID, TALENT_START_LEVEL, index);
  const skillCooldownSeconds = skillMultiplier(3);
  const mortuaryRiteCooldownSeconds = skillMultiplier(4);
  const extensionSeconds = skillMultiplier(2);
  const burstSeconds = burstMultiplier(12) + BURST_DURATION_CAST_FRAMES / 60;

  const normalAttacks: KitAction[] = INVOKER_STRIKES.map((strike) => createStrikeAction(strike, attackMultiplier, {}));
  const pactswornNormalAttacks: KitAction[] = PACTSWORN_STRIKES.map((strike) =>
    createStrikeAction(strike, burstMultiplier, {
      additiveBaseDamageBonus: pactswornNormalAttackBonus,
      element: Element.Electro,
      gauge: 1,
    }),
  );

  const chargedAttack: KitAction = {
    hits: [
      {
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: attackMultiplier(5),
      },
    ],
    seconds: CHARGED_ATTACK_FRAMES / 60,
    targetingArea: STRIKE_TARGETING_AREA,
  };
  const pactswornChargedAttack: KitAction = {
    hits: [
      {
        element: Element.Electro,
        gauge: 1,
        hitArea: CHARGED_ATTACK_HIT_AREA,
        hitmarkSeconds: PACTSWORN_CHARGED_ATTACK_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: burstMultiplier(6),
      },
    ],
    seconds: PACTSWORN_CHARGED_ATTACK_FRAMES / 60,
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

  // Mortuary Rite's cooldown of three seconds is priced as the factor of Secret Rite's while Pactsworn Pathclearer holds, which
  // Is the press that the stance's skill plays; the skill's cooldown the press then sets is the one left after the stance
  const mortuaryRiteHit: KitHit = {
    element: Element.Electro,
    gauge: 1,
    hitArea: MORTUARY_RITE_HIT_AREA,
    hitmarkSeconds: MORTUARY_RITE_HITMARK_FRAMES / 60,
    isBlunt: true,
    poiseDamage: MORTUARY_RITE_POISE_DAMAGE,
    talentMultiplier: skillMultiplier(1),
  };
  const mortuaryRite: KitAction = {
    hits: [mortuaryRiteHit],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
      const { characterId } = combatant;
      const stance = findKitStance(kitEffectState.effects, characterId);
      if (!stance) return;
      const extensions = findKitStatus(kitEffectState.effects, characterId, BURST_EXTENSIONS_STATUS_ID)?.stacks ?? 0;
      if (extensions < BURST_EXTENSIONS_MAX) {
        stance.secondsRemaining += extensionSeconds;
        const judication = findJudicationField(kitEffectState.effects, characterId);
        if (judication) judication.secondsRemaining += extensionSeconds;
        addKitEffect(kitEffectState, {
          characterId,
          id: BURST_EXTENSIONS_STATUS_ID,
          kind: "status",
          secondsRemaining: stance.secondsRemaining,
          stacks: extensions + 1,
        });
      }
      if (!checkHasKitStatus(kitEffectState.effects, characterId, ENDSEER_STATUS_ID)) return;
      if (combatant.constellationCount >= CONSTELLATION_6)
        addDayOfTheJackal(
          kitEffectState,
          characterId,
          Math.min(
            C6_STACKS_MAX,
            (findKitStatus(kitEffectState.effects, characterId, C6_STATUS_ID)?.stacks ?? 0) + C6_STACKS_PER_TRIGGER,
          ),
        );
      castKitSummon(
        kitEffectState,
        body,
        combatant,
        Array.from({ length: DUSTSTALKER_BOLT_COUNT }, () =>
          createDuststalkerBoltHit(MORTUARY_RITE_HITMARK_FRAMES / 60),
        ),
      );
    },
    seconds: MORTUARY_RITE_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  // Judication is a field round the body, which the burst's stance lets run for its seconds, each tick giving Endseer while the
  // Stance holds
  const createJudicationField = (body: KitBody, characterId: number): KitField => ({
    centre: { x: body.position.x, z: body.position.z },
    characterId,
    id: JUDICATION_FIELD_ID,
    kind: "field",
    nextTickSeconds: JUDICATION_FIRST_FRAMES / 60,
    onTick: ({ kitEffectState }) => {
      if (!findKitStance(kitEffectState.effects, characterId)) return;
      addKitEffect(kitEffectState, {
        characterId,
        id: ENDSEER_STATUS_ID,
        kind: "status",
        secondsRemaining: ENDSEER_FRAMES / 60,
      });
    },
    radius: UNBOUNDED_FIELD_RADIUS,
    secondsRemaining: burstSeconds,
    tickIndex: 0,
    tickIntervalSeconds: JUDICATION_INTERVAL_FRAMES / 60,
  });

  const elementalBurst: KitAction = {
    hits: [],
    onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
      const { ascension, characterId, constellationCount } = combatant;
      // The Pactsworn Pathclearer strikes stay Normal Attack DMG though they deal Electro, gcsim's AttackTagNormal in
      // Cyno/attack.go's attackB, beside AttackTagExtra in cyno/charge.go's chargeB and AttackTagElementalArt in
      // Cyno/skill.go's skillB
      enterKitStance(
        kitEffectState,
        combatant,
        {
          chargedAttack: pactswornChargedAttack,
          chargedAttackStamina: attackMultiplier(6),
          elementalBurst,
          elementalSkill: mortuaryRite,
          normalAttacks: pactswornNormalAttacks,
        },
        burstSeconds,
      );
      addKitEffect(kitEffectState, {
        amount: burstMultiplier(11),
        attribute: Attribute.ElementalMastery,
        characterId,
        kind: "buff",
        secondsRemaining: burstSeconds,
        source: BURST_BUFF_SOURCE,
      });
      addKitEffect(kitEffectState, {
        characterId,
        id: BURST_EXTENSIONS_STATUS_ID,
        kind: "status",
        secondsRemaining: burstSeconds,
        stacks: 0,
      });
      if (constellationCount >= CONSTELLATION_4)
        addKitEffect(kitEffectState, {
          characterId,
          id: C4_STATUS_ID,
          kind: "status",
          secondsRemaining: burstSeconds,
          stacks: 0,
        });
      if (constellationCount >= CONSTELLATION_6) addDayOfTheJackal(kitEffectState, characterId, C6_STACKS_PER_TRIGGER);
      if (ascension >= ASCENSION_1) addKitEffect(kitEffectState, createJudicationField(body, characterId));
    },
    seconds: BURST_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const elementalSkill: KitAction = {
    hits: [
      {
        element: Element.Electro,
        gauge: 1,
        hitArea: SKILL_HIT_AREA,
        hitmarkSeconds: SKILL_HITMARK_FRAMES / 60,
        poiseDamage: 0,
        talentMultiplier: skillMultiplier(0),
      },
    ],
    seconds: SKILL_FRAMES / 60,
    targetingArea: SKILL_TARGETING_AREA,
  };

  const plungeCollision: KitHit = {
    hitArea: PLUNGE_COLLISION_HIT_AREA,
    hitmarkSeconds: PLUNGE_COLLISION_HITMARK_FRAMES / 60,
    poiseDamage: 0,
    talentMultiplier: attackMultiplier(7),
  };

  return {
    burstCooldownSeconds: burstMultiplier(13),
    burstEnergyCost: burstMultiplier(14),
    chargedAttack,
    chargedAttackStamina: attackMultiplier(6),
    elementalBurst,
    elementalSkill,
    // Mortuary Rite's cooldown is the factor of Secret Rite's while Pactsworn Pathclearer holds, so the stance's skill press
    // Waits out three seconds rather than seven and a half
    getSkillCooldownMultiplier: ({ activeCombatant: combatant, kitEffectState }) =>
      findKitStance(kitEffectState.effects, combatant.characterId)
        ? mortuaryRiteCooldownSeconds / skillCooldownSeconds
        : 1,
    highPlunge: createPlunge(
      HIGH_PLUNGE_HIT_AREA,
      HIGH_PLUNGE_HITMARK_FRAMES,
      HIGH_PLUNGE_FRAMES,
      HIGH_PLUNGE_POISE_DAMAGE,
      9,
    ),
    lowPlunge: createPlunge(
      LOW_PLUNGE_HIT_AREA,
      LOW_PLUNGE_HITMARK_FRAMES,
      LOW_PLUNGE_FRAMES,
      LOW_PLUNGE_POISE_DAMAGE,
      8,
    ),
    normalAttacks,
    // Leaving the field ends Pactsworn Pathclearer, its Elemental Mastery and Judication, as gcsim's exit deletes the burst
    onKitEvent: (event, { characterIdCombatantMap, kitEffectState, party }, combatant) => {
      const { characterId } = combatant;
      if (event.kind === KitEventKind.CharacterSwapped) {
        if (event.previousCharacterId !== characterId) return;
        const stance = findKitStance(kitEffectState.effects, characterId);
        if (stance) stance.secondsRemaining = 0;
        const buff = kitEffectState.effects.find(
          (effect) =>
            effect.kind === "buff" && effect.characterId === characterId && effect.source === BURST_BUFF_SOURCE,
        );
        if (buff?.kind === "buff") buff.secondsRemaining = 0;
        const judication = findJudicationField(kitEffectState.effects, characterId);
        if (judication) judication.secondsRemaining = 0;
        return;
      }
      if (event.kind !== KitEventKind.ReactionTriggered) return;
      // Constellation 4's energy: a reaction a normal attack or any Pactsworn hit of Cyno's sets off restores 3 energy to each
      // Other member of the deployed team, up to five times a burst
      const counter = findKitStatus(kitEffectState.effects, characterId, C4_STATUS_ID);
      if (
        combatant.constellationCount < CONSTELLATION_4 ||
        event.striker.characterId !== characterId ||
        !counter ||
        (counter.stacks ?? 0) >= C4_STACKS_MAX ||
        !findKitStance(kitEffectState.effects, characterId) ||
        !event.reactions.some(checkIsC4Reaction)
      )
        return;
      counter.stacks = (counter.stacks ?? 0) + 1;
      for (const memberId of party.teams[party.deployedTeamIndex]?.characterIds ?? []) {
        if (memberId === characterId) continue;
        const member = characterIdCombatantMap.get(memberId);
        if (member) gainPartyMemberEnergy(party, member, C4_ENERGY);
      }
    },
    plungeCollision,
    skillCooldownSeconds,
  };
};
