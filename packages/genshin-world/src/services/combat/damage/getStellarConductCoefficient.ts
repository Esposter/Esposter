import {
  STELLAR_CONDUCT_COEFFICIENT_PER_HIT,
  STELLAR_CONDUCT_MAX_RECORDED_HITS,
  STELLAR_CONDUCT_RECORDED_COEFFICIENT_BONUS,
} from "#src/services/combat/damage/constants";

// The Base Reaction Coefficient of a Stellar-Conduct by the Cryo and Electro hits its Starlight Prism recorded: 1 with none,
// Otherwise 40% more, plus 5% for each hit up to 12, from the wiki's Stellar-Conduct page
export const getStellarConductCoefficient = (recordedHits: number): number => {
  if (recordedHits < 1) return 1;
  return (
    1 +
    STELLAR_CONDUCT_RECORDED_COEFFICIENT_BONUS +
    STELLAR_CONDUCT_COEFFICIENT_PER_HIT * Math.min(recordedHits, STELLAR_CONDUCT_MAX_RECORDED_HITS)
  );
};
