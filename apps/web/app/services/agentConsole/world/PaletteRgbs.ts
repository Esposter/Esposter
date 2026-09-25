import type { Vector3Tuple } from "three";

import { PaletteColors } from "@/models/agentConsole/PaletteColor";
import { AgentConsolePaletteMap } from "@/services/agentConsole/AgentConsolePaletteMap";
import { Color } from "three";

// The palette in three's linear working space, in `PaletteColors` order — the order a voxel grid indexes it by
export const PaletteRgbs = PaletteColors.map((paletteColor): Vector3Tuple => {
  const { b, g, r } = new Color(AgentConsolePaletteMap[paletteColor]);
  return [r, g, b];
});
