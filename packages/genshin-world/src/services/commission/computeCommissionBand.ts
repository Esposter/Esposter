import { COMMISSION_RANK_BAND_COUNT, COMMISSION_RANK_BAND_SIZE } from "#src/services/commission/constants";

// The index of the band an Adventure Rank falls in, the first band's being zero. A rank past the last band's top stays in
// The last band
export const computeCommissionBand = (rank: number): number =>
  Math.min(Math.ceil(rank / COMMISSION_RANK_BAND_SIZE), COMMISSION_RANK_BAND_COUNT) - 1;
