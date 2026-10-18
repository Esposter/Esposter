// Columbina's Benediction adds Base DMG to her team's Lunar reactions, 0.2% for every 1,000 of her max HP, up to 7%, as
// gcsim's columbina/asc.go gives it and the benediction's text does (TextMap 79900803)
const BENEDICTION_BASE_DAMAGE_BONUS_PER_MAX_HEALTH = 0.002 / 1000;
const BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS = 0.07;

export const getBenedictionBaseDamageBonus = (maxHealth: number): number =>
  Math.min(maxHealth * BENEDICTION_BASE_DAMAGE_BONUS_PER_MAX_HEALTH, BENEDICTION_MAXIMUM_BASE_DAMAGE_BONUS);
