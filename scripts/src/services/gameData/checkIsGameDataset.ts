import { GameDataset } from "genshin-world";

export const checkIsGameDataset = (dataset: string): dataset is GameDataset =>
  (Object.values(GameDataset) as string[]).includes(dataset);
