import { FITTED_DECIMALS } from "#src/services/genshinAssets/shared/constants";

// A fitted number kept to the centimetre, as every data file `fit` writes keeps them
export const roundFitted = (value: number): number => Number(value.toFixed(FITTED_DECIMALS));
