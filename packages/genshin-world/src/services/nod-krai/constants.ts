import type { RegionMoon } from "#src/models/sky/RegionMoon";

import { DEFAULT_SKY_SHAPE } from "genshin-engine";

// Provisional: the dieselpunk works' riveted iron in sRGB, the colour a palette keeps where it leaves it out
export const NOD_KRAI_IRON_COLOR = 0x4a4e57;
// Provisional: Nod-Krai's night moon, its size and brightness the standard moon's until a night reference of the moon is
// Measured. The size is the sky's moon size and the brightness scales its glow. Its reference is missing, so both stand
// At the standard moon's values
export const NOD_KRAI_MOON: Readonly<RegionMoon> = { brightness: 1, size: DEFAULT_SKY_SHAPE.moonSize };
