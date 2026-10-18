import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const XIANYUN_CHARACTER_ID = 10_000_093;

const CONSTELLATION_1 = 1;

// Xianyun's behaviour: none of her own, since her four strikes, charged attack, plunges, Skyladder's first press and
// Stars Gather at Dusk's hit are her record's alone. Driftcloud Wave, her two further Skyladder presses, Starwicker, the
// Burst's heals, her airborne buff, her passives and Constellations 2, 4 and 6 are not built
// Constellation 1's charge is built
// Constellation 2 needs the Skyladder's ATK buff for 15s, which the kit does not build
// Constellation 4 needs the Skyladder count in one Cloud Transmogrification, which the kit does not build
// Constellation 6 needs a CRIT DMG bonus on the Driftcloud Wave, which no strike hook can apply here
export const createXianyunKitBehaviour = (): KitBehaviour => ({
  // Purifying Wind, from Constellation 1: White Clouds at Dawn gains one more charge
  getSkillChargeBonus: (combatant) => (combatant.constellationCount >= CONSTELLATION_1 ? 1 : 0),
});
