import { checkIsEnumValue } from "#src/services/shared/checkIsEnumValue";
import { GameDataset } from "genshin-world";

export const checkIsGameDataset = (dataset: string): dataset is GameDataset => checkIsEnumValue(GameDataset, dataset);
