import { REPUTATION_DISCOUNT_PERCENT, REPUTATION_DISCOUNT_ROUNDING } from "#src/services/reputation/constants";

// A price a nation's discount takes its percentage off, rounded down to the multiple of the rounding step beneath it, in
// The player's favour
export const computeReputationDiscountedPrice = (price: number): number => {
  const discountedPrice = (price * (100 - REPUTATION_DISCOUNT_PERCENT)) / 100;
  return Math.floor(discountedPrice / REPUTATION_DISCOUNT_ROUNDING) * REPUTATION_DISCOUNT_ROUNDING;
};
