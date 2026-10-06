import { FITTED_DECIMALS } from "#src/services/genshinAssets/shared/constants";

// A fitted number kept to the centimetre, as every data file `fit` writes keeps them, or to as many decimals as a fit
// Finer than that asks
export const roundFitted = (value: number, decimals: number = FITTED_DECIMALS): number =>
  Number(value.toFixed(decimals));
