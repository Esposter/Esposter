import {
  STELLAR_CONDUCT_ELEMENTAL_DMG_BONUS,
  STELLAR_CONDUCT_ELEMENTAL_DMG_BONUS_PER_HIT,
  STELLAR_CONDUCT_MAX_RECORDED_HITS,
  STELLAR_CONDUCT_RECORDED_ELEMENTAL_DMG_BONUS,
} from "#src/services/combat/damage/constants";

// The Cryo and Electro DMG Bonus of a character in a Starlight Prism's field by the hits it recorded: 20% with none, otherwise
// 28% plus 1% for each hit up to 12, from the wiki's Stellar-Conduct page
export const getStellarConductElementalDmgBonus = (recordedHits: number): number => {
  if (recordedHits < 1) return STELLAR_CONDUCT_ELEMENTAL_DMG_BONUS;
  return (
    STELLAR_CONDUCT_RECORDED_ELEMENTAL_DMG_BONUS +
    STELLAR_CONDUCT_ELEMENTAL_DMG_BONUS_PER_HIT * Math.min(recordedHits, STELLAR_CONDUCT_MAX_RECORDED_HITS)
  );
};
