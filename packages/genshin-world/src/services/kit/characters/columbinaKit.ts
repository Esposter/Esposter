import type { ReactionType } from "#src/models/combat/ReactionType";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsLunarReactionType } from "#src/services/combat/checkIsLunarReactionType";
import { getBenedictionBaseDamageBonus } from "#src/services/kit/characters/columbinaBenediction";
import { createKitBody } from "#src/services/kit/createKitBody";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitHold } from "#src/services/kit/effects/checkIsKitHold";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { getKitMaxHealth } from "#src/services/kit/effects/getKitMaxHealth";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { MOONRIDGE_DEW_MAXIMUM_COUNT } from "#src/services/party/constants";
import { countDew } from "#src/services/party/countDew";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";
import { spendDew } from "#src/services/party/spendDew";
import { toKitSeconds } from "#src/services/shared/toKitSeconds";
import { takeOne } from "@esposter/shared";

export const COLUMBINA_CHARACTER_ID = 10_000_125;
// The name the skill's DoT field is found by, so a recast while it runs restarts it rather than stacking a second one
const COLUMBINA_SKILL_FIELD_ID = "columbina-gravity-interference";
// The reach from the field's centre that the DoT's tick takes at Ascendant Gleam, as gcsim gives it, where the record's
// Own reach of four stands below it
const ASCENDANT_GLEAM_SKILL_DOT_RADIUS = 6;
// Measured: gcsim (MIT) columbina/asc.go, Ascension 1's CRIT Rate of 5% for each Lunacy stack, up to three, which each
// Gravity Interference tick gains (skill.go) and which restarts every stack's 10 seconds
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/columbina/asc.go
const ASCENSION_1 = 1;
const LUNACY_ID = "columbina-lunacy";
const LUNACY_CRIT_RATE_PER_STACK = 0.05;
const LUNACY_MAX_STACKS = 3;
const LUNACY_SECONDS = 10;
const GRAVITY_MAX = 60;
const GRAVITY_PER_SECOND = 10;
const GRAVITY_SECONDS = 2;
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_ENERGY = 6;
const CONSTELLATION_1_ICD_ID = "columbina-c1-icd";
const CONSTELLATION_1_ICD_SECONDS = 15;
const CONSTELLATION_1_SHIELD_HEALTH_SHARE = 0.12;
const CONSTELLATION_1_SHIELD_SECONDS = 8;
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_GRAVITY_RATE = 0.34;
const CONSTELLATION_2_HEALTH_SHARE = 0.4;
const CONSTELLATION_2_HEALTH_SOURCE = "columbina-c2-health";
const CONSTELLATION_2_SECONDS = 8;
// The team buff a Gravity Ripple gives its active member, of the reaction it fires, with the share of her max HP it adds
const CONSTELLATION_2_TEAM_BUFFS: Record<
  LunarReactionType,
  { amountPerMaxHealth: number; attribute: Attribute; source: string }
> = {
  [LunarReactionType.LunarBloom]: {
    amountPerMaxHealth: 0.0035,
    attribute: Attribute.ElementalMastery,
    source: "columbina-c2-lunar-bloom",
  },
  [LunarReactionType.LunarCharged]: {
    amountPerMaxHealth: 0.01,
    attribute: Attribute.Attack,
    source: "columbina-c2-lunar-charged",
  },
  [LunarReactionType.LunarCrystallize]: {
    amountPerMaxHealth: 0.01,
    attribute: Attribute.Defense,
    source: "columbina-c2-lunar-crystallize",
  },
};
const CONSTELLATION_2_TEAM_SOURCES = new Set(Object.values(CONSTELLATION_2_TEAM_BUFFS).map(({ source }) => source));
// The Lunar reactions in the order gcsim reads them, which breaks a tie in gravity toward the first
const GRAVITY_REACTION_TYPES = [
  LunarReactionType.LunarCharged,
  LunarReactionType.LunarBloom,
  LunarReactionType.LunarCrystallize,
] as const;
// The reaction a team with no gravity built fires, by the element its members hold most of, the first of them on a tie
const ELEMENT_REACTION_TYPES: [Element, LunarReactionType][] = [
  [Element.Electro, LunarReactionType.LunarCharged],
  [Element.Dendro, LunarReactionType.LunarBloom],
  [Element.Geo, LunarReactionType.LunarCrystallize],
];
// The burst's window, the 1.2 seconds its Lunar damage bonus holds, in which a Lunar reaction gives Constellation 6's buffs
const BURST_WINDOW_ID = "columbina-burst-window";
const BURST_WINDOW_SECONDS = 1.2;
// Measured: gcsim (MIT) columbina/asc.go, Ascension 4's Moonridge Dew: a Lunar-Bloom in her burst's window gives one, at
// Most three each eighteen seconds from the first, three frames apart (lines 120-145)
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/columbina/asc.go
const ASCENSION_4 = 4;
const MOONRIDGE_DEW_ICD_ID = "columbina-moonridge-dew-icd";
const MOONRIDGE_DEW_ICD_SECONDS = toKitSeconds(3);
const MOONRIDGE_DEW_WINDOW_ID = "columbina-moonridge-dew-window";
const MOONRIDGE_DEW_WINDOW_SECONDS = toKitSeconds(18 * 60);
const MOONRIDGE_DEW_GAINS_PER_WINDOW = 3;
// Moondew Cleanse spends one Dew, the verdant first, and its Lunar-Bloom hits ignore all of each enemy's DEF, as gcsim's
// ChargeAttackBloom gives them (charge.go 101 and 110). It spends at the press rather than at gcsim's ConsumeDew frame, which
// Only a Dew read by another member's press in the frames between the two tells apart
const MOONDEW_CLEANSE_DEW_COUNT = 1;
const MOONDEW_CLEANSE_DEFENCE_IGNORED = 1;
// Moondew Cleanse spends no stamina, as the wiki's Normal Attack text and gcsim's columbina.go both give it
const MOONDEW_CLEANSE_STAMINA_MULTIPLIER = 0;
// Moondew Cleanse stands while the party holds a Dew to spend, the check both its variant and its stamina cut read
const checkIsMoondewCleanse = ({ party }: KitContext): boolean => countDew(party) > 0;

// Gains the party a Moonridge Dew for a Lunar-Bloom in the burst's window, as gcsim's a4OnLunarBloom does. The window
// Counts the gains it has taken and runs from the first, and the gains come no faster than the cooldown lets them
const gainMoonridgeDew = (context: KitContext): void => {
  const { kitEffectState, party } = context;
  const { effects } = kitEffectState;
  if (!checkIsKitStatusActive(effects, COLUMBINA_CHARACTER_ID, BURST_WINDOW_ID)) return;
  if (checkIsKitStatusActive(effects, COLUMBINA_CHARACTER_ID, MOONRIDGE_DEW_ICD_ID)) return;
  const dewWindow = findKitStatus(effects, COLUMBINA_CHARACTER_ID, MOONRIDGE_DEW_WINDOW_ID);
  const gains = dewWindow?.stacks ?? 0;
  if (gains >= MOONRIDGE_DEW_GAINS_PER_WINDOW) return;
  // A gain re-adds the window with the seconds it has left, so only the first gain starts its eighteen seconds
  addKitStatus(kitEffectState, COLUMBINA_CHARACTER_ID, {
    id: MOONRIDGE_DEW_WINDOW_ID,
    secondsRemaining: dewWindow?.secondsRemaining ?? MOONRIDGE_DEW_WINDOW_SECONDS,
    stacks: gains + 1,
  });
  addKitStatus(kitEffectState, COLUMBINA_CHARACTER_ID, {
    id: MOONRIDGE_DEW_ICD_ID,
    secondsRemaining: MOONRIDGE_DEW_ICD_SECONDS,
  });
  // Like gcsim, the window counts the gain even while the party holds its most
  party.moonridgeDew = Math.min(party.moonridgeDew + 1, MOONRIDGE_DEW_MAXIMUM_COUNT);
};
const CONSTELLATION_6 = 6;
// Constellation 6's CRIT DMG for each buff a Lunar reaction gives every party member, on the elements the buff covers
const CONSTELLATION_6_CRITICAL_DAMAGE = 0.8;
const CONSTELLATION_6_SECONDS = 8;
const CONSTELLATION_6_BUFFS = new Map<ReactionType, { elements: Set<Element>; id: string }>([
  [
    LunarReactionType.LunarBloom,
    { elements: new Set([Element.Dendro, Element.Hydro]), id: "columbina-c6-lunar-bloom" },
  ],
  [
    LunarReactionType.LunarCharged,
    { elements: new Set([Element.Electro, Element.Hydro]), id: "columbina-c6-lunar-charged" },
  ],
  [
    LunarReactionType.LunarCrystallize,
    { elements: new Set([Element.Geo, Element.Hydro]), id: "columbina-c6-lunar-crystallize" },
  ],
]);

// Gaining Lunacy restarts the stacks the character holds, so they run out together as gcsim's do, then adds one up to three
const gainLunacy = (kitEffectState: KitEffectState, characterId: number): void => {
  const heldIds = kitEffectState.effects.flatMap((effect) =>
    checkIsKitHold(effect, characterId, LUNACY_ID) ? [effect.id] : [],
  );
  for (const id of heldIds) addKitStatus(kitEffectState, characterId, { id, secondsRemaining: LUNACY_SECONDS });
  addKitHold(kitEffectState, characterId, { id: LUNACY_ID, maximum: LUNACY_MAX_STACKS, seconds: LUNACY_SECONDS });
};

// The gravity a Gravity Interference field builds from the team's Lunar reactions, by the reaction each one builds, and the
// Lunar reaction the field last read, which the gravity is built as for the seconds left of its window
interface Gravity {
  amounts: Record<LunarReactionType, number>;
  lastReactionType?: LunarReactionType;
  windowSeconds: number;
}
// Each skill field's gravity, read back by a press that restarts its field or a step of the field
const gravities = new WeakMap<KitField, Gravity>();

const createGravity = (): Gravity => ({
  amounts: {
    [LunarReactionType.LunarBloom]: 0,
    [LunarReactionType.LunarCharged]: 0,
    [LunarReactionType.LunarCrystallize]: 0,
  },
  windowSeconds: 0,
});

const getGravityRate = (combatant: Combatant): number =>
  combatant.constellationCount >= CONSTELLATION_2 ? CONSTELLATION_2_GRAVITY_RATE : 0;

const getTotalGravity = (gravity: Gravity): number =>
  GRAVITY_REACTION_TYPES.reduce((total, reactionType) => total + gravity.amounts[reactionType], 0);

// The gravity built over a step: ten a second, scaled by Constellation 2, for the seconds of the window the step covers
const accrueGravity = (gravity: Gravity, stepSeconds: number, rate: number): void => {
  if (gravity.lastReactionType !== undefined)
    gravity.amounts[gravity.lastReactionType] +=
      Math.max(0, Math.min(stepSeconds, gravity.windowSeconds)) * GRAVITY_PER_SECOND * (1 + rate);
  gravity.windowSeconds = Math.max(0, gravity.windowSeconds - stepSeconds);
};

// The reaction a Gravity Ripple fires: the one with the most gravity, or with none built, the one the team's elements favour
const pickGravityReaction = (gravity: Gravity, { characterIdCombatantMap, party }: KitContext): LunarReactionType => {
  const elements = getDeployedCharacterIds(party).map(
    (characterId) => characterIdCombatantMap.get(characterId)?.element,
  );
  const countOf = (element: Element): number => elements.filter((member) => member === element).length;
  let reactionType = LunarReactionType.LunarCharged;
  let leaderCount = -1;
  for (const [element, elementReactionType] of ELEMENT_REACTION_TYPES)
    if (countOf(element) > leaderCount) {
      leaderCount = countOf(element);
      reactionType = elementReactionType;
    }
  let maxGravity = 0;
  for (const gravityReactionType of GRAVITY_REACTION_TYPES)
    if (gravity.amounts[gravityReactionType] > maxGravity) {
      maxGravity = gravity.amounts[gravityReactionType];
      reactionType = gravityReactionType;
    }
  return reactionType;
};

// Constellation 1's energy for Lunar-Charged, and its Rainsea shield on Lunar-Crystallize, which Columbina casts on herself
const applyConstellation1 = (context: KitContext, combatant: Combatant, reactionType: LunarReactionType): void => {
  if (reactionType === LunarReactionType.LunarCharged)
    gainPartyMemberEnergy(context.party, context.activeCombatant, CONSTELLATION_1_ENERGY);
  else if (reactionType === LunarReactionType.LunarCrystallize)
    castKitShield(context, COLUMBINA_CHARACTER_ID, {
      element: Element.Hydro,
      health:
        CONSTELLATION_1_SHIELD_HEALTH_SHARE *
        getKitMaxHealth(combatant, context.kitEffectState.effects, context.party, context.characterIdCombatantMap),
      secondsRemaining: CONSTELLATION_1_SHIELD_SECONDS,
    });
};

// Constellation 2's HP for Columbina, and with the Moonsign at Ascendant Gleam, the reaction's stat on the active member alone,
// Which the reaction's stat replaces from the team's other members
const applyConstellation2 = (context: KitContext, combatant: Combatant, reactionType: LunarReactionType): void => {
  buffKitMember(context.kitEffectState, COLUMBINA_CHARACTER_ID, {
    amount: CONSTELLATION_2_HEALTH_SHARE,
    attribute: Attribute.HealthPercent,
    secondsRemaining: CONSTELLATION_2_SECONDS,
    source: CONSTELLATION_2_HEALTH_SOURCE,
  });
  if (getMoonsignLevel(context.characterIdCombatantMap, context.party) !== MoonsignLevel.AscendantGleam) return;
  const { amountPerMaxHealth, attribute, source } = CONSTELLATION_2_TEAM_BUFFS[reactionType];
  for (const effect of context.kitEffectState.effects)
    if (
      effect.kind === "buff" &&
      effect.source !== undefined &&
      effect.source !== source &&
      CONSTELLATION_2_TEAM_SOURCES.has(effect.source)
    )
      effect.secondsRemaining = 0;
  buffKitMember(context.kitEffectState, context.activeCombatant.characterId, {
    amount:
      amountPerMaxHealth *
      getKitMaxHealth(combatant, context.kitEffectState.effects, context.party, context.characterIdCombatantMap),
    attribute,
    isEndedOnSwap: true,
    secondsRemaining: CONSTELLATION_2_SECONDS,
    source,
  });
};

// A Gravity Ripple fires on the reaction its gravity picks, clearing the gravity if it is the one that clears it. Its hit is not
// Built, as the record holds none of the ripple's multipliers or hitmarks, but Ascension 1's Lunacy and the constellations' effects run on it
const fireGravityRipple = (
  context: KitContext,
  combatant: Combatant,
  gravity: Gravity,
  clearsGravity: boolean,
): void => {
  const reactionType = pickGravityReaction(gravity, context);
  if (clearsGravity) for (const gravityReactionType of GRAVITY_REACTION_TYPES) gravity.amounts[gravityReactionType] = 0;
  if (combatant.ascension >= ASCENSION_1) gainLunacy(context.kitEffectState, combatant.characterId);
  if (combatant.constellationCount >= CONSTELLATION_1) applyConstellation1(context, combatant, reactionType);
  if (combatant.constellationCount >= CONSTELLATION_2) applyConstellation2(context, combatant, reactionType);
};

// Constellation 6's CRIT DMG on a strike, from each buff its striker holds that covers the hit's element, one buff each
const getConstellation6CriticalDamage = (strike: KitStrike, effects: readonly KitEffect[]): number => {
  const element = getKitHitElement(strike.hit, strike.combatant);
  if (element === undefined) return 0;
  let criticalDamage = 0;
  for (const { elements, id } of CONSTELLATION_6_BUFFS.values())
    if (elements.has(element) && checkIsKitStatusActive(effects, strike.combatant.characterId, id))
      criticalDamage += CONSTELLATION_6_CRITICAL_DAMAGE;
  return criticalDamage;
};

// Columbina's behaviour: her skill's DoT, a field that follows her body and ticks its hit round its centre from the press's
// Hit for the table's duration, which a press while it runs restarts. Its tick reaches further while her team is at Ascendant
// Gleam. Her Moonsign Benediction counts her toward that level, and its Base DMG bonus is the curve of her max HP.
// That curve sits in columbinaBenediction.ts. Ascension 1's Lunacy gains a stack on each Gravity Ripple, not each tick,
// And its CRIT Rate is the stacks' share.
// The burst's field is not built yet
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/columbina/skill.go
// The Gravity Ripple's hit is not built, as the record holds none of its multipliers or hitmarks, so the ripple runs its
// Lunacy and constellation effects without the hit. Constellation 4 needs the ripple's hits, its energy for each and its flat DMG
// Constellation 6's CRIT DMG on strikes is built on the burst's window, but its CRIT DMG on the Lunar reaction's own damage
// Needs the reaction's element, which KitReaction does not carry. The window's Lunar damage bonus itself is not built
// Ascension 4's Moonridge Dew is built on the Lunar-Bloom reaction, while its extra hits on Lunar-Charged and Lunar-Crystallize
// Need the Lunar reactions hook, as the team's Lunar reactions are not read yet
export const createColumbinaKitBehaviour = ({
  kit,
  readHit,
  readParameter,
  readSeconds,
}: KitRecordReader): KitBehaviour => {
  const skillDotHit = readHit("skillDot");
  const skillDotFirstTickSeconds = readSeconds("skillDotFirstTick");
  const skillDotIntervalSeconds = readSeconds("skillDotInterval");
  // The DoT runs for the table's duration from the press's hit
  const skillDurationSeconds = readParameter("skillDurationSeconds") + takeOne(kit.elementalSkill.hits).hitmarkSeconds;
  // The DoT's hit as a tick deals it, its reach widened while the team it ticks in is at Ascendant Gleam
  const getSkillDotHit = ({ characterIdCombatantMap, party }: KitContext): KitHit =>
    getMoonsignLevel(characterIdCombatantMap, party) === MoonsignLevel.AscendantGleam
      ? { ...skillDotHit, hitArea: { ...skillDotHit.hitArea, radius: ASCENDANT_GLEAM_SKILL_DOT_RADIUS } }
      : skillDotHit;

  // The DoT's field follows her body, and each tick deals its hit round the field's centre, priced by her as she cast it.
  // The field also builds gravity from the team's Lunar reactions, which a Gravity Ripple fires once it reaches its maximum
  const castSkillField = (kitEffectState: KitEffectState, body: KitBody, combatant: Combatant): Gravity => {
    const gravity = createGravity();
    const field = castKitField(kitEffectState, combatant.characterId, body.position, {
      id: COLUMBINA_SKILL_FIELD_ID,
      isFollowing: true,
      nextTickSeconds: skillDotFirstTickSeconds,
      onEvent: (event) => {
        if (event.kind !== KitEventKind.ReactionTriggered) return;
        for (const { reactionType } of event.reactions)
          if (checkIsLunarReactionType(reactionType)) {
            gravity.lastReactionType = reactionType;
            gravity.windowSeconds = GRAVITY_SECONDS;
          }
      },
      onStep: (context, _field, stepSeconds) => {
        accrueGravity(gravity, stepSeconds, getGravityRate(combatant));
        if (getTotalGravity(gravity) >= GRAVITY_MAX) fireGravityRipple(context, combatant, gravity, true);
      },
      onTick: (tickContext) => {
        castKitSummon(
          tickContext.kitEffectState,
          createKitBody(field.centre),
          combatant,
          [getSkillDotHit(tickContext)],
          { attackTag: AttackTag.ElementalSkill },
        );
      },
      secondsRemaining: skillDurationSeconds,
      tickIntervalSeconds: skillDotIntervalSeconds,
    });
    gravities.set(field, gravity);
    return gravity;
  };

  return {
    burst: {
      onStart: ({ kitEffectState }) => {
        addKitStatus(kitEffectState, COLUMBINA_CHARACTER_ID, {
          id: BURST_WINDOW_ID,
          secondsRemaining: BURST_WINDOW_SECONDS,
        });
      },
    },
    chargedAttackVariant: {
      checkIsActive: checkIsMoondewCleanse,
      onStart: ({ party }) => {
        spendDew(party, MOONDEW_CLEANSE_DEW_COUNT);
      },
    },
    // Moondew Cleanse takes her charged attack's place while Dew stands, and spends none of its stamina
    getChargedAttackStaminaMultiplier: (context) =>
      checkIsMoondewCleanse(context) ? MOONDEW_CLEANSE_STAMINA_MULTIPLIER : 1,
    getPartyStrikeBonus: (_member, strike, _enemy, _party, effects) => ({
      criticalDamageBonus: getConstellation6CriticalDamage(strike, effects),
    }),
    getStrikeCriticalDamageBonus: (strike, _enemy, _party, effects) => getConstellation6CriticalDamage(strike, effects),
    getStrikeCriticalRateBonus: ({ combatant }, _enemy, _party, effects) =>
      countKitHolds(effects, combatant.characterId, LUNACY_ID) * LUNACY_CRIT_RATE_PER_STACK,
    // Moondew Cleanse's Lunar-Bloom hits ignore all of each enemy's DEF, as gcsim's IgnoreDefPercent gives them; her
    // Charged attack's other hits carry no Lunar reaction
    getStrikeDefenceIgnored: ({ attackTag, hit }) =>
      attackTag === AttackTag.ChargedAttack && hit.lunarHit?.lunarReactionType === LunarReactionType.LunarBloom
        ? MOONDEW_CLEANSE_DEFENCE_IGNORED
        : 0,
    moonsignBenediction: {
      getBaseDamageBonus: ({ attributes }) => getBenedictionBaseDamageBonus(attributes.maxHealth),
    },
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered) return;
      if (
        combatant.ascension >= ASCENSION_4 &&
        event.reactions.some(({ reactionType }) => reactionType === LunarReactionType.LunarBloom)
      )
        gainMoonridgeDew(context);
      if (combatant.constellationCount < CONSTELLATION_6) return;
      // The buffs need a Lunar reaction in the burst's window, which gcsim's Lunar damage bonus holds for its 1.2 seconds
      if (!checkIsKitStatusActive(context.kitEffectState.effects, COLUMBINA_CHARACTER_ID, BURST_WINDOW_ID)) return;
      for (const { reactionType } of event.reactions) {
        const buff = CONSTELLATION_6_BUFFS.get(reactionType);
        if (buff)
          for (const characterId of context.party.characterIdMemberMap.keys())
            addKitStatus(context.kitEffectState, characterId, {
              id: buff.id,
              secondsRemaining: CONSTELLATION_6_SECONDS,
            });
      }
    },
    skill: {
      onStart: (context) => {
        const { activeCombatant: combatant, body, kitEffectState } = context;
        // A press while the DoT runs restarts its duration and keeps its gravity, as gcsim clears gravity only when no skill
        // Stands, and keeps its ticks. A press with none standing starts from no gravity
        const standingField = kitEffectState.effects.find(
          (effect): effect is KitField =>
            effect.kind === "field" &&
            effect.id === COLUMBINA_SKILL_FIELD_ID &&
            effect.characterId === combatant.characterId,
        );
        let gravity: Gravity;
        if (standingField === undefined) gravity = castSkillField(kitEffectState, body, combatant);
        else {
          standingField.secondsRemaining = skillDurationSeconds;
          gravity = gravities.get(standingField) ?? createGravity();
        }
        // Constellation 1's Gravity Ripple fires on each press, once every fifteen seconds
        if (
          combatant.constellationCount >= CONSTELLATION_1 &&
          startKitCooldown(kitEffectState, combatant.characterId, CONSTELLATION_1_ICD_ID, CONSTELLATION_1_ICD_SECONDS)
        )
          fireGravityRipple(context, combatant, gravity, false);
      },
    },
  };
};
