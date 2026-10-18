import { FLOAT_RESIDUE } from "#src/services/floatResidue";

// Whether an amount has reached its target, a residue short of the target counting as reached
export const checkIsAmountReached = (amount: number, target: number): boolean => amount >= target - FLOAT_RESIDUE;
