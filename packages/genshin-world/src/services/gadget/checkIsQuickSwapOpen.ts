import { QUICK_SWAP_HOLD_SECONDS } from "#src/services/gadget/constants";

// Whether Z held for `heldSeconds` opens the quick swap. A shorter press uses the equipped gadget on its release instead
export const checkIsQuickSwapOpen = (heldSeconds: number): boolean => heldSeconds >= QUICK_SWAP_HOLD_SECONDS;
