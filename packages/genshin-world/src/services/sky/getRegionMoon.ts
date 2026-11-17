import type { RegionMoon } from "#src/models/sky/RegionMoon";

import { RegionId } from "#src/models/shared/RegionId";
import { NOD_KRAI_MOON } from "#src/services/nod-krai/constants";
import { DEFAULT_SKY_SHAPE } from "genshin-engine";

// The standard moon, which every region keeps unless it names its own
const STANDARD_MOON: Readonly<RegionMoon> = { brightness: 1, size: DEFAULT_SKY_SHAPE.moonSize };
// The regions whose night moon is their own, keyed by their save's region id
const RegionIdMoonMap: Partial<Record<string, Readonly<RegionMoon>>> = { [RegionId.NodKrai]: NOD_KRAI_MOON };

// A region's moon at night: its own override, or the standard moon where it names none
export const getRegionMoon = (regionId: string): Readonly<RegionMoon> => RegionIdMoonMap[regionId] ?? STANDARD_MOON;
