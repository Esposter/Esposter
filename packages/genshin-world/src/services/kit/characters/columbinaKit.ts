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

import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { getBenedictionBaseDamageBonus } from "#src/services/kit/characters/columbinaBenediction";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitHold } from "#src/services/kit/effects/checkIsKitHold";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { getMoonsignLevel } from "#src/services/party/getMoonsignLevel";
import { takeOne } from "@esposter/shared";

export const COLUMBINA_CHARACTER_ID = 10_000_125;
// The name the skill's DoT field is found by, so a recast while it runs restarts it rather than stacking a second one
const COLUMBINA_SKILL_FIELD_ID = "columbina-gravity-interference";
// The reach from the field's centre that the DoT's tick takes at Ascendant Gleam, as gcsim gives it, where the record's
// Own reach of four stands below it
const ASCENDANT_GLEAM_SKILL_DOT_RADIUS = 6;
// Measured: gcsim (MIT) columbina/asc.go, Ascension 1's CRIT Rate of 5% for each Lunacy stack, up to three, which each
// Gravity Interference tick gains (skill.go) and which restarts every stack's 10 seconds
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/columbina/asc.go
const ASCENSION_1 = 1;
const LUNACY_ID = "columbina-lunacy";
const LUNACY_CRIT_RATE_PER_STACK = 0.05;
const LUNACY_MAX_STACKS = 3;
const LUNACY_SECONDS = 10;
// The burst's window, the 1.2 seconds its Lunar damage bonus holds, in which a Lunar reaction gives Constellation 6's buffs
const BURST_WINDOW_ID = "columbina-burst-window";
const BURST_WINDOW_SECONDS = 1.2;
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
// That curve sits in columbinaBenediction.ts. Ascension 1's Lunacy gains a stack on each tick, and its CRIT Rate is the stacks' share.
// The burst's field is not built yet
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/columbina/skill.go
// Constellation 1 needs Eternal Tides' Gravity Interference effect, which the skill's field does not carry
// Constellation 2 needs Gravity Ripple, which the skill does not summon yet
// Constellation 4 needs Gravity Ripple's hits on Gravity Interference, which are not built
// Constellation 6's CRIT DMG on strikes is built on the burst's window, but its CRIT DMG on the Lunar reaction's own damage
// Needs the reaction's element, which KitReaction does not carry. The window's Lunar damage bonus itself is not built
// Ascension 4 needs the Lunar reactions hook, as the team's Lunar reactions are not read yet
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

  // The DoT's field follows her body, and each tick deals its hit round the field's centre, priced by her as she cast it
  const castSkillField = (kitEffectState: KitEffectState, body: KitBody, combatant: Combatant): void => {
    const field = castKitField(kitEffectState, combatant.characterId, body.position, {
      id: COLUMBINA_SKILL_FIELD_ID,
      isFollowing: true,
      nextTickSeconds: skillDotFirstTickSeconds,
      onTick: (tickContext) => {
        castKitSummon(tickContext.kitEffectState, { facing: 0, height: 0, position: field.centre }, combatant, [
          getSkillDotHit(tickContext),
        ]);
        // Each tick is a Gravity Interference trigger, which gains her a Lunacy stack from Ascension 1
        if (combatant.ascension >= ASCENSION_1) gainLunacy(tickContext.kitEffectState, combatant.characterId);
      },
      secondsRemaining: skillDurationSeconds,
      tickIntervalSeconds: skillDotIntervalSeconds,
    });
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
    getPartyStrikeBonus: (_member, strike, _enemy, _party, effects) => ({
      criticalDamageBonus: getConstellation6CriticalDamage(strike, effects),
    }),
    getStrikeCriticalDamageBonus: (strike, _enemy, _party, effects) => getConstellation6CriticalDamage(strike, effects),
    getStrikeCriticalRateBonus: ({ combatant }, _enemy, _party, effects) =>
      countKitHolds(effects, combatant.characterId, LUNACY_ID) * LUNACY_CRIT_RATE_PER_STACK,
    moonsignBenediction: {
      getBaseDamageBonus: ({ attributes }) => getBenedictionBaseDamageBonus(attributes.maxHealth),
    },
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.ReactionTriggered || combatant.constellationCount < CONSTELLATION_6) return;
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
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        // A press while the DoT runs restarts its duration, as gcsim restarts the status and keeps its ticks
        const standingField = kitEffectState.effects.find(
          (effect): effect is KitField =>
            effect.kind === "field" &&
            effect.id === COLUMBINA_SKILL_FIELD_ID &&
            effect.characterId === combatant.characterId,
        );
        if (standingField === undefined) castSkillField(kitEffectState, body, combatant);
        else standingField.secondsRemaining = skillDurationSeconds;
      },
    },
  };
};
