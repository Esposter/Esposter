import type { EncounterPoints } from "#src/models/commission/EncounterPoints";
import type { LongTermEncounterPointConversion } from "#src/models/commission/LongTermEncounterPointConversion";
import type { LongTermEncounterPoints } from "#src/models/commission/LongTermEncounterPoints";
import type { Wallet } from "#src/models/inventory/Wallet";

import { HALF_POINTS_PER_ENCOUNTER_POINT, LONG_TERM_RESIN_COST } from "#src/services/commission/constants";
import { readEncounterPoints } from "#src/services/commission/readEncounterPoints";
import { readLongTermEncounterPoints } from "#src/services/commission/readLongTermEncounterPoints";
import { spendOriginalResin } from "#src/services/originalResin/spendOriginalResin";

// A Long-Term Encounter Point converted into an Encounter Point for the Original Resin it costs, while the daily points fall
// Short of the storage by a whole point. Undefined where the long-term points hold less than a whole point, the daily points
// Leave no room for one, or the resin cannot pay, so nothing is converted or spent
export const convertLongTermEncounterPoint = ({
  encounterPoints,
  longTermEncounterPoints,
  majorVersion,
  now,
  storage,
  wallet,
}: {
  encounterPoints: EncounterPoints;
  longTermEncounterPoints: LongTermEncounterPoints;
  majorVersion: number;
  now: Temporal.Instant;
  storage: number;
  wallet: Wallet;
}): LongTermEncounterPointConversion | undefined => {
  const longTerm = readLongTermEncounterPoints(longTermEncounterPoints, majorVersion);
  if (longTerm.halfPoints < HALF_POINTS_PER_ENCOUNTER_POINT) return undefined;
  const points = readEncounterPoints(encounterPoints, now);
  if (points.halfPoints + HALF_POINTS_PER_ENCOUNTER_POINT > storage) return undefined;
  const paidWallet = spendOriginalResin(wallet, LONG_TERM_RESIN_COST, now);
  if (!paidWallet) return undefined;
  return {
    encounterPoints: { ...points, halfPoints: points.halfPoints + HALF_POINTS_PER_ENCOUNTER_POINT },
    longTermEncounterPoints: { halfPoints: longTerm.halfPoints - HALF_POINTS_PER_ENCOUNTER_POINT, majorVersion },
    wallet: paidWallet,
  };
};
