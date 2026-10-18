import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { takeOne } from "@esposter/shared";

export const COLUMBINA_CHARACTER_ID = 10_000_125;
// The name the skill's DoT field is found by, so a recast while it runs restarts it rather than stacking a second one
const COLUMBINA_SKILL_FIELD_ID = "columbina-gravity-interference";

// Columbina's behaviour: her skill's DoT, a field that follows her body and ticks its hit round its centre from the press's
// Hit for the table's duration, which a press while it runs restarts. gcsim's DoT reaches further from Moonsign level 2,
// Which waits on the Moonsign hook, and the burst's field, whose buff reads the Lunar reactions, waits on that hook
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/columbina/skill.go
// Constellation 1 needs Eternal Tides' Gravity Interference effect, which the skill's field does not carry
// Constellation 2 needs Gravity Ripple, which the skill does not summon yet
// Constellation 4 needs Gravity Ripple's hits on Gravity Interference, which are not built
// Constellation 6 needs the Lunar Domain's buff, which waits on the Lunar reactions hook
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

  // The DoT's field follows her body, and each tick deals its hit round the field's centre, priced by her as she cast it
  const castSkillField = (kitEffectState: KitEffectState, body: KitBody, combatant: Combatant): void => {
    const field = castKitField(kitEffectState, combatant.characterId, body.position, {
      id: COLUMBINA_SKILL_FIELD_ID,
      isFollowing: true,
      nextTickSeconds: skillDotFirstTickSeconds,
      onTick: ({ kitEffectState: tickKitEffectState }) =>
        castKitSummon(tickKitEffectState, { facing: 0, height: 0, position: field.centre }, combatant, [skillDotHit]),
      secondsRemaining: skillDurationSeconds,
      tickIntervalSeconds: skillDotIntervalSeconds,
    });
  };

  return {
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
