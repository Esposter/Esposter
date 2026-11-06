import { checkIsEnumValue } from "@esposter/shared";
import { GameDataset } from "genshin-world";

export const checkIsGameDataset = (dataset: string): dataset is GameDataset => checkIsEnumValue(GameDataset, dataset);
