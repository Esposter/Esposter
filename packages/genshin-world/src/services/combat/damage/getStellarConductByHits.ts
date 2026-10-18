import { STELLAR_CONDUCT_MAX_RECORDED_HITS } from "#src/services/combat/damage/constants";

// A Stellar-Conduct value by the Cryo and Electro hits its Starlight Prism recorded: the unrecorded value with none,
// And otherwise the recorded value plus the per-hit amount for each hit up to the maximum
export const getStellarConductByHits = (
  recordedHits: number,
  unrecordedValue: number,
  recordedValue: number,
  perHitValue: number,
): number => {
  if (recordedHits < 1) return unrecordedValue;
  return recordedValue + perHitValue * Math.min(recordedHits, STELLAR_CONDUCT_MAX_RECORDED_HITS);
};
