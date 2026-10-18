import {
  STELLAR_CONDUCT_ELEMENTAL_DAMAGE_BONUS,
  STELLAR_CONDUCT_ELEMENTAL_DAMAGE_BONUS_PER_HIT,
  STELLAR_CONDUCT_RECORDED_ELEMENTAL_DAMAGE_BONUS,
} from "#src/services/combat/damage/constants";
import { getStellarConductByHits } from "#src/services/combat/damage/getStellarConductByHits";

// The Cryo and Electro DMG Bonus of a character in a Starlight Prism's field by the hits it recorded: 20% with none, otherwise
// 28% plus 1% for each hit up to 12, from the wiki's Stellar-Conduct page
export const getStellarConductElementalDamageBonus = (recordedHits: number): number =>
  getStellarConductByHits(
    recordedHits,
    STELLAR_CONDUCT_ELEMENTAL_DAMAGE_BONUS,
    STELLAR_CONDUCT_RECORDED_ELEMENTAL_DAMAGE_BONUS,
    STELLAR_CONDUCT_ELEMENTAL_DAMAGE_BONUS_PER_HIT,
  );
