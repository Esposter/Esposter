import { QUICK_SWAP_GADGET_LIMIT } from "#src/services/gadget/constants";

// The quick swap with a gadget chosen from the bag added to it, by its item id. A quick swap already holding its limit
// Refuses the gadget, so it comes back as it was
export const addQuickSwapGadget = (quickSwapItemIds: readonly number[], itemId: number): number[] =>
  quickSwapItemIds.length < QUICK_SWAP_GADGET_LIMIT ? [...quickSwapItemIds, itemId] : [...quickSwapItemIds];
