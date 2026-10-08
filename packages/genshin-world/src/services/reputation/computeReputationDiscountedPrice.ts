import { REPUTATION_DISCOUNT_PERCENT, REPUTATION_DISCOUNT_ROUNDING } from "#src/services/reputation/constants";

// A price a nation's discount takes its percentage off, then rounded to the nearest rounding step. A price halfway between
// Two steps goes to the lower, in the player's favour
export const computeReputationDiscountedPrice = (price: number): number => {
  const discountedPrice = (price * (100 - REPUTATION_DISCOUNT_PERCENT)) / 100;
  return (
    Math.ceil((discountedPrice - REPUTATION_DISCOUNT_ROUNDING / 2) / REPUTATION_DISCOUNT_ROUNDING) *
    REPUTATION_DISCOUNT_ROUNDING
  );
};
