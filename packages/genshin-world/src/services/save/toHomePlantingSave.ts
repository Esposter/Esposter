import type { HomePlanting } from "#src/models/home/HomePlanting";
import type { HomePlantingSave } from "#src/models/home/HomePlantingSave";

// One planting as the save holds it, its instant as the ISO string
export const toHomePlantingSave = ({ plantedAt, plotId, seedItemId }: HomePlanting): HomePlantingSave[number] => ({
  plantedAt: plantedAt.toString(),
  plotId,
  seedItemId,
});
