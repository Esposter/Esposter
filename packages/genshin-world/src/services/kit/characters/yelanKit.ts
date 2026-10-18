import type { KitBehaviour } from "#src/models/kit/KitBehaviour";
import type { KitRecordReader } from "#src/models/kit/KitRecordReader";

import { Attribute } from "#src/models/character/Attribute";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { castKitField } from "#src/services/kit/effects/castKitField";
import { castKitSummon } from "#src/services/kit/effects/castKitSummon";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { gainKitResource } from "#src/services/kit/effects/gainKitResource";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { takeOne } from "@esposter/shared";

// Provisional: Depth-Clarion Dice waves an Exquisite Throw each second, its first a second after the burst's hit, as
// Gcsim's ticker starts from the hit's status
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yelan/burst.go
const EXQUISITE_THROW_WAVE_SECONDS = 1;
// The field lives a tenth of a second past its seconds, so the step that runs its last wave still has it
const FIELD_LINGER_SECONDS = 0.1;
const DEPTH_CLARION_DICE_ID = "yelan-depth-clarion";
// Breakthrough Barb: each Lingering Lifeline strike on an enemy rolls for it at 34%, and a standing Barb is held as one
// Resource up to one, as gcsim's skill callback sets the breakthrough state, which her fully charged arrow spends
const BREAKTHROUGH_BARB_CHANCE = 0.34;
const BREAKTHROUGH_BARB_ID = "yelan-breakthrough-barb";
// Ascension 4: from the burst's hit, the active character deals 1% more DMG, rising 3.5% each whole second up to 50%,
// For 15 seconds, as gcsim v2.47.2 (MIT) yelan/asc.go gives it, starting its status at the hitmark as burst.go does.
// A recast of the burst restarts the status, which dispels the earlier one as the description gives it
// https://github.com/genshinsim/gcsim/blob/v2.47.2/internal/characters/yelan/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_STATUS_ID = "yelan-ascension-4";
const ASCENSION_4_SECONDS = 15;
const ASCENSION_4_BASE_DAMAGE_BONUS = 0.01;
const ASCENSION_4_DAMAGE_BONUS_PER_SECOND = 0.035;
const ASCENSION_4_MAX_DAMAGE_BONUS = 0.5;

export const YELAN_CHARACTER_ID = 10_000_060;

const CONSTELLATION_1 = 1;

// Yelan's behaviour: Depth-Clarion Dice sets its field as it is cast, which waves an Exquisite Throw each second from a
// Second after its hit for its seconds, and each Lingering Lifeline hit throws one more while the field stands.
// Her Breakthrough Barb's own hit, her Ascension 1 passive and Constellations 2, 4 and 6 are not built. Her Ascension 4
// Passive is built from the burst's hit
// Constellation 1's charge is built
// Constellation 2 needs Exquisite Throw's coordinated attack and its extra arrow, which the kit does not build
// Constellation 4 needs the marked opponents on Lifeline's explosion, which the kit does not build
// Constellation 6 needs the Mastermind state after Depth-Clarion Dice, which the kit does not build
export const createYelanKitBehaviour = ({ kit, readHits, readParameter }: KitRecordReader): KitBehaviour => {
  const burstHitmarkSeconds = takeOne(kit.elementalBurst.hits).hitmarkSeconds;
  const depthClarionDiceSeconds = readParameter("depthClarionDiceSeconds");
  const exquisiteThrows = readHits("exquisiteThrow");
  return {
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
        if (combatant.ascension >= ASCENSION_4)
          scheduleKitTask(
            kitEffectState,
            combatant.characterId,
            burstHitmarkSeconds,
            ({ kitEffectState: tickKitEffectState }) => {
              addKitStatus(tickKitEffectState, combatant.characterId, {
                id: ASCENSION_4_STATUS_ID,
                secondsRemaining: ASCENSION_4_SECONDS,
              });
            },
          );
      },
    },
    // Ascension 4's damage bonus goes to the active character, so a swap moves it on the next step. Its amount is set
    // By the whole seconds the status has run, which its remaining seconds count down
    onStep: ({ activeCombatant, kitEffectState }, combatant) => {
      const status = findKitStatus(kitEffectState.effects, combatant.characterId, ASCENSION_4_STATUS_ID);
      if (!status) return;
      const elapsedSeconds = ASCENSION_4_SECONDS - status.secondsRemaining;
      buffKitMember(kitEffectState, activeCombatant.characterId, {
        amount: Math.min(
          ASCENSION_4_MAX_DAMAGE_BONUS,
          ASCENSION_4_BASE_DAMAGE_BONUS + ASCENSION_4_DAMAGE_BONUS_PER_SECOND * Math.floor(elapsedSeconds),
        ),
        attribute: Attribute.AllDamageBonus,
        isEndedOnSwap: true,
        secondsRemaining: status.secondsRemaining,
        source: ASCENSION_4_STATUS_ID,
      });
    },
    // The burst's field waves its throws from where Yelan cast it, and it rings the body wherever it moves, as the field's
    // Ticks do not depend on where the body stands
    // Enter the Plotters, from Constellation 1: Lingering Lifeline gains one more charge
    getSkillChargeBonus: (combatant) => (combatant.constellationCount >= CONSTELLATION_1 ? 1 : 0),
    // A Lingering Lifeline hit throws an Exquisite Throw from her body while the burst's field stands, as gcsim's marked
    // Hit does while its burst status holds
    skill: {
      hits: [
        {
          onStrike: ({ kitEffectState, random }, { body, combatant }) => {
            if (random() < BREAKTHROUGH_BARB_CHANCE)
              gainKitResource(kitEffectState, combatant.characterId, BREAKTHROUGH_BARB_ID, 1, 1);
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
