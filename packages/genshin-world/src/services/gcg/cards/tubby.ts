import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { takeOne } from "@esposter/shared";

const TUBBY_ID = 322_006;
const TUBBY_REDUCTION = 2;

// Tubby: when a Location Support Card is played, two dice of any face less are spent, once a round
export const tubby: GcgCardModule = {
  onCostPaid: ({ duel, sideIndex }, subject) => {
    if (subject.card?.isLocation) takeOne(duel.sides, sideIndex).usedCardIds.push(TUBBY_ID);
  },
  reduceCost: ({ duel, sideIndex }, subject) =>
    subject.card?.isLocation && !takeOne(duel.sides, sideIndex).usedCardIds.includes(TUBBY_ID)
      ? { count: TUBBY_REDUCTION, element: undefined }
      : undefined,
};
