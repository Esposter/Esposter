import type { HomePlanting } from "#src/models/home/HomePlanting";
import type { HomePlantingSave } from "#src/models/home/HomePlantingSave";

// One planting read back from its save, its instant read back into its Temporal instant
export const toHomePlanting = ({ plantedAt, plotId, seedItemId }: HomePlantingSave[number]): HomePlanting => ({
  plantedAt: Temporal.Instant.from(plantedAt),
  plotId,
  seedItemId,
});
