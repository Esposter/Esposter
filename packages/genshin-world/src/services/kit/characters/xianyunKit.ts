import type { KitBehaviour } from "#src/models/kit/KitBehaviour";

export const XIANYUN_CHARACTER_ID = 10_000_093;

// Xianyun's behaviour: none of her own, since her four strikes, charged attack, plunges, Skyladder's first press and
// Stars Gather at Dusk's hit are her record's alone. Driftcloud Wave, her two further Skyladder presses, Starwicker, the
// Burst's heals, her airborne buff, her passives and constellations are not built
export const createXianyunKitBehaviour = (): KitBehaviour => ({});
