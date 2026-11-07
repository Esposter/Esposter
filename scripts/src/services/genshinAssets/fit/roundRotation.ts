import { ROTATION_DECIMALS } from "#src/services/genshinAssets/shared/constants";

// A rotation's component kept to the ten-thousandth, as every data file `fit` writes keeps its turns
export const roundRotation = (value: number): number => Math.round(value * ROTATION_DECIMALS) / ROTATION_DECIMALS;
