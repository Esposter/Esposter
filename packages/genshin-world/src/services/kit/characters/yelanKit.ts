import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { takeOne } from "@esposter/shared";

// Provisional: Depth-Clarion Dice waves an Exquisite Throw each second, its first a second after the burst's hit, as
// Gcsim's ticker starts from the hit's status
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yelan/burst.go
const EXQUISITE_THROW_WAVE_SECONDS = 1;
// The field lives a tenth of a second past its seconds, so the step that runs its last wave still has it
const FIELD_LINGER_SECONDS = 0.1;
const DEPTH_CLARION_DICE_ID = "yelan-depth-clarion";

export const YELAN_CHARACTER_ID = 10_000_060;

// Yelan's behaviour: Depth-Clarion Dice sets its field as it is cast, which waves an Exquisite Throw each second from a
// Second after its hit for its seconds, and each Lingering Lifeline hit throws one more while the field stands.
// Breakthrough Barb, her passives and constellations are not built
export const createYelanKitBehaviour = ({ kit, readHits, readParameter }: KitRecordReader): KitBehaviour => {
  const burstHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const depthClarionDiceSeconds = readParameter("depthClarionDiceSeconds");
  const exquisiteThrows = readHits("exquisiteThrow");
  return {
    // The burst's field waves its throws from where Yelan cast it, and it rings the body wherever it moves, as the field's
    // Ticks do not depend on where the body stands
    burst: {
      onStart: ({ activeCombatant: combatant, body, kitEffectState }) => {
        const { facing, height, position } = body;
        castKitField(kitEffectState, combatant.characterId, position, {
          id: DEPTH_CLARION_DICE_ID,
          nextTickSeconds: burstHitmarkSeconds + EXQUISITE_THROW_WAVE_SECONDS,
          onTick: ({ kitEffectState: tickKitEffectState }) =>
            castKitSummon(tickKitEffectState, { facing, height, position }, combatant, exquisiteThrows),
          secondsRemaining: burstHitmarkSeconds + depthClarionDiceSeconds + FIELD_LINGER_SECONDS,
          tickIntervalSeconds: EXQUISITE_THROW_WAVE_SECONDS,
        });
      },
    },
    // A Lingering Lifeline hit throws an Exquisite Throw from her body while the burst's field stands, as gcsim's marked
    // Hit does while its burst status holds
    skill: {
      hits: [
        {
          onStrike: ({ kitEffectState }, { body, combatant }) => {
            if (
              !kitEffectState.effects.some((effect) => effect.kind === "field" && effect.id === DEPTH_CLARION_DICE_ID)
            )
              return;
            castKitSummon(kitEffectState, body, combatant, exquisiteThrows);
          },
        },
      ],
    },
  };
};
