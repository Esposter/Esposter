import { readMondstadtExpeditionPlaces } from "#src/services/genshinAssets/expeditions/readMondstadtExpeditionPlaces";
import { GameDataset } from "genshin-world/definitions";

// Mondstadt's expedition places as one record of the expeditions dataset
export const buildMondstadtExpeditions = (): Record<string, unknown> => ({
  [`${GameDataset.Expeditions}/mondstadt`]: readMondstadtExpeditionPlaces(),
});
