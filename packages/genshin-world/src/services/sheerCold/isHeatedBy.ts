import type { HeatSource } from "#src/models/sheerCold/HeatSource";

import { SHEER_COLD_HEAT_RADIUS } from "#src/services/sheerCold/constants";

// Whether a point is heated by a lit heat source within the radius of it, an unlit one heating nothing
export const isHeatedBy = (x: number, z: number, heatSources: readonly HeatSource[]): boolean =>
  heatSources.some(
    (heatSource) => heatSource.isLit && Math.hypot(heatSource.x - x, heatSource.z - z) <= SHEER_COLD_HEAT_RADIUS,
  );
