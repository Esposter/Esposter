import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { MoonsignLevel } from "#src/models/combat/MoonsignLevel";
import { getBenedictionBaseDamageBonus } from "#src/services/kit/characters/columbinaBenediction";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { checkIsKitHold } from "#src/services/kit/effects/checkIsKitHold";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
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

// Gaining Lunacy restarts the stacks the character holds, so they run out together as gcsim's do, then adds one up to three
const gainLunacy = (kitEffectState: KitEffectState, characterId: number): void => {
  const heldIds = kitEffectState.effects.flatMap((effect) =>
    checkIsKitHold(effect, characterId, LUNACY_ID) ? [effect.id] : [],
  );
  for (const id of heldIds) addKitStatus(kitEffectState, characterId, { id, secondsRemaining: LUNACY_SECONDS });
  addKitHold(kitEffectState, characterId, { id: LUNACY_ID, maximum: LUNACY_MAX_STACKS, seconds: LUNACY_SECONDS });
};

// Columbina's behaviour: her skill's DoT, a field that follows her body and ticks its hit round its centre from the press's
// Hit for the table's duration, which a press while it runs restarts. Its tick reaches further while her team is at Ascendant
// Gleam. Her Moonsign Benediction counts her toward that level, and its Base DMG bonus is the curve of her max HP in
// columbinaBenediction.ts. Ascension 1's Lunacy gains a stack on each tick, and its CRIT Rate is the stacks' share. The
// burst's field is not built yet
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/columbina/skill.go
// Constellation 1 needs Eternal Tides' Gravity Interference effect, which the skill's field does not carry
// Constellation 2 needs Gravity Ripple, which the skill does not summon yet
// Constellation 4 needs Gravity Ripple's hits on Gravity Interference, which are not built
// Constellation 6 needs the Lunar Domain's buff, which waits on the Lunar reactions hook
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
    getStrikeCriticalRateBonus: ({ combatant }, _enemy, _party, effects) =>
      countKitHolds(effects, combatant.characterId, LUNACY_ID) * LUNACY_CRIT_RATE_PER_STACK,
    moonsignBenediction: {
      getBaseDamageBonus: ({ attributes }) => getBenedictionBaseDamageBonus(attributes.maxHealth),
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
