import { checkIsEnumValue } from "@esposter/shared";
import { GameDataset } from "genshin-world/definitions";

export const checkIsGameDataset = (dataset: string): dataset is GameDataset => checkIsEnumValue(GameDataset, dataset);
