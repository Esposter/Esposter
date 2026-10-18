import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";

// Measured: gcsim (MIT) emilie/cons.go, Constellation 2's Dendro RES cut of 30% for 10 seconds on each enemy the skill's
// Hits strike, whose damage is not zero
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/emilie/cons.go
const CONSTELLATION_2 = 2;
const CONSTELLATION_2_STATUS: EnemyStatus = {
  damageTakenBonus: 0,
  id: "emilie-constellation-2",
  resistanceReduction: { [Element.Dendro]: 0.3 },
  secondsRemaining: 10,
};
// Measured: gcsim (MIT) emilie/asc.go, Ascension 4's DMG Bonus of 0.15 per 1000 total ATK, capped at 36%, on each attack
// That strikes a Burning enemy
// https://github.com/genshinsim/gcsim/blob/main/internal/characters/emilie/asc.go
const ASCENSION_4 = 4;
const ASCENSION_4_ATTACK_SHARE = 0.15;
const ASCENSION_4_DAMAGE_BONUS_CAP = 0.36;

// Constellation 2's status on each hit that strikes, from two constellations
const getConstellationStatus = ({ constellationCount }: Combatant): EnemyStatus | undefined =>
  constellationCount >= CONSTELLATION_2 ? CONSTELLATION_2_STATUS : undefined;

// The DMG Bonus Ascension 4 adds to a strike of Emilie's that lands on an enemy Burning, read from her total ATK
const getAscension4DamageBonus = (combatant: Combatant, enemy: Enemy): number =>
  combatant.ascension >= ASCENSION_4 && enemy.elementalState.auras.has(AuraType.Burning)
    ? Math.min((combatant.attributes.attack / 1000) * ASCENSION_4_ATTACK_SHARE, ASCENSION_4_DAMAGE_BONUS_CAP)
    : 0;

export const EMILIE_CHARACTER_ID = 10_000_099;

// Emilie's behaviour: the Lumidouce Case's summon hit and Spiritbreath Thorn each cut the Dendro RES of the enemy they
// Strike from Constellation 2, and from Ascension 4 each strike of hers on a Burning enemy adds a DMG Bonus read from her
// Total ATK. Thorn's cooldown has always run out before the skill's comes round again, so every press lands it. Not built:
// The Lumidouce Case's ticks, its levels and Cleardew, so the skill deals its summon hit and Thorn only; and the burst,
// The Lumidouce Case at level 3 striking a random enemy in its area every 0.3 seconds and moving on Cleardew, so until
// The Cleardew hook lands the burst deals nothing and only spends its energy
// Constellation 1 needs Fragrance Extraction's DMG and Cleardew Cologne's Lingering Fragrance, which are not built
// Constellation 4 needs Aromatic Explication's duration and target interval, which the Lumidouce Case does not build
// Constellation 6 needs Abiding Fragrance and Aromatic Explication's bursts, which are not built
export const createEmilieKitBehaviour = (): KitBehaviour => ({
  getStrikeDamageBonus: ({ combatant }, enemy) => getAscension4DamageBonus(combatant, enemy),
  skill: { hits: [{ enemyStatus: getConstellationStatus }, { enemyStatus: getConstellationStatus }] },
});
