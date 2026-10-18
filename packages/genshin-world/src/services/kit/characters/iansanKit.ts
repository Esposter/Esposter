import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsAmountReached } from "#src/services/checkIsAmountReached";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { enterKitNightsoulBlessing } from "#src/services/kit/effects/enterKitNightsoulBlessing";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

export const IANSAN_CHARACTER_ID = 10_000_110;

// Her Nightsoul points are set to 54 as her blessing is entered, which lasts 16 seconds, as gcsim (MIT) iansan/skill.go and
// Iansan.go set them, and her blessing drains 0.6 points every six frames, six a second (nightsoulPointReduceTask)
const NIGHTSOUL_POINTS = 54;
const NIGHTSOUL_BLESSING_SECONDS = 16;
const NIGHTSOUL_DRAIN_PER_SECOND = 6;

// Constellation 1's energy, as gcsim (MIT) iansan/cons.go c1 gives it: each 6 points her blessing consumes restore her 15
// Energy, then her cooldown of 18 seconds starts, and points consumed while it runs are not counted
const CONSTELLATION_1 = 1;
const CONSTELLATION_1_COOLDOWN_ID = "iansan-constellation-1-cooldown";
const CONSTELLATION_1_COOLDOWN_SECONDS = 18;
const CONSTELLATION_1_ENERGY = 15;
const CONSTELLATION_1_POINTS = 6;
const CONSTELLATION_1_POINTS_ID = "iansan-constellation-1-points";

// Iansan's behaviour: her skill's press enters the Nightsoul Blessing with its points, which drain six a second for the 16
// Seconds it lasts. gcsim ends the blessing when the points fall to 0.2, and the kit ends it when they reach none, a gap of
// A thirtieth of a second. Not built: the Electro Swift Stormflight that swaps her charged attack in the blessing, the burst's
// Party ATK bonus and its conversion of the points into ATK, and the points her Ascension and constellations add. Her
// Strikes and plunges are her record's alone
// Constellation 1's energy from each 6 Nightsoul points consumed is built
// Constellation 2 needs Precise Movement on the burst, which the kit does not build
// Constellation 4 needs the Surging Force stacks after another character's burst, which the kit does not read
// Constellation 6 needs the Kinetic Energy Scale's extra 3 seconds and Extreme Force on overflow, not built
export const createIansanKitBehaviour = (): KitBehaviour => ({
  onKitEvent: (event, { kitEffectState, party }, combatant) => {
    const { characterId, constellationCount } = combatant;
    if (
      event.kind !== KitEventKind.NightsoulPointsConsumed ||
      event.characterId !== characterId ||
      constellationCount < CONSTELLATION_1 ||
      checkIsKitStatusActive(kitEffectState.effects, characterId, CONSTELLATION_1_COOLDOWN_ID)
    )
      return;

    const points =
      (findKitStatus(kitEffectState.effects, characterId, CONSTELLATION_1_POINTS_ID)?.stacks ?? 0) + event.points;
    if (!checkIsAmountReached(points, CONSTELLATION_1_POINTS)) {
      addKitStatus(kitEffectState, characterId, {
        id: CONSTELLATION_1_POINTS_ID,
        secondsRemaining: Number.POSITIVE_INFINITY,
        stacks: points,
      });
      return;
    }

    // The count starts again from none, and the energy and the cooldown come with it
    addKitStatus(kitEffectState, characterId, {
      id: CONSTELLATION_1_POINTS_ID,
      secondsRemaining: Number.POSITIVE_INFINITY,
      stacks: 0,
    });
    startKitCooldown(kitEffectState, characterId, CONSTELLATION_1_COOLDOWN_ID, CONSTELLATION_1_COOLDOWN_SECONDS);
    gainPartyMemberEnergy(party, combatant, CONSTELLATION_1_ENERGY);
  },
  skill: {
    onStart: ({ activeCombatant, kitEffectState }) =>
      enterKitNightsoulBlessing(kitEffectState, activeCombatant.characterId, {
        nightsoulRate: { maximum: NIGHTSOUL_POINTS, perSecond: -NIGHTSOUL_DRAIN_PER_SECOND },
        points: NIGHTSOUL_POINTS,
        secondsRemaining: NIGHTSOUL_BLESSING_SECONDS,
      }),
  },
});
