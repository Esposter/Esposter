import { GameDataset } from "#src/models/data/GameDataset";

// The lock's ground keys of one region, the one selection every region's ground is read by: its plateau alone while the
// Lock holds it, else its pieces and their quarters, each under its own key. Windrise's base is read by it too
export const selectRegionGroundKeys = <K extends string>(keys: readonly K[], region: string): K[] => {
  const plateauKey = `${GameDataset.Ground}/${region}`;
  const plateauKeys = keys.filter((key) => key === plateauKey);
  if (plateauKeys.length > 0) return plateauKeys;
  return keys.filter((key) => key.startsWith(`${plateauKey}/`));
};
