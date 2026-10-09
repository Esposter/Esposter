import type { CommissionSlice } from "#src/models/commission/CommissionSlice";

import { commissionSliceSchema } from "#src/models/commission/CommissionSlice";

// Mondstadt's daily tasks, the slice `pnpm -C scripts genshin:assets commissions` writes, imported on demand as a chunk of
// Its own and checked against its shape as it arrives
export const readMondstadtCommissions = async (): Promise<CommissionSlice> => {
  const { default: mondstadtCommissions } = await import("#src/generated/commissions/mondstadt.json");
  return commissionSliceSchema.parse(mondstadtCommissions);
};
