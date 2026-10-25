import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { STATUE_DECIMALS } from "#src/services/genshinAssets/shared/constants";

export const roundStatue = (value: number): number => roundFitted(value, STATUE_DECIMALS);
