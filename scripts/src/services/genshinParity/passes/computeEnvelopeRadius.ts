import { closeFamilyMask } from "#src/services/genshinParity/passes/closeFamilyMask";
import { computeMaskHoles } from "#src/services/genshinParity/passes/computeMaskHoles";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The radius a scattered family is closed at to read as its envelope, the cards' spacing as the exports draw them: the
// Least radius at which every hole either half of the cards leaves, closed, is a hole the whole family leaves too. A
// Smaller one leaves the gaps one half's cards open where the other half's fill, so the envelope still reads the cards'
// Scatter; a hole every sample leaves is the crown's own window and stays
export const computeEnvelopeRadius = (
  wholeMask: ArrayLike<number>,
  halfMasks: readonly ArrayLike<number>[],
  width: number,
  height: number,
): number => {
  for (let radius = 1; radius < Math.min(width, height) / 2; radius++) {
    const isWholeHole = new Uint8Array(width * height);
    for (const hole of computeMaskHoles(closeFamilyMask(wholeMask, width, height, radius), width, height))
      for (const pixel of hole) isWholeHole[pixel] = 1;
    const isSpaced = halfMasks.every((halfMask) =>
      computeMaskHoles(closeFamilyMask(halfMask, width, height, radius), width, height).every((hole) =>
        hole.some((pixel) => isWholeHole[pixel] === 1),
      ),
    );
    if (isSpaced) return radius;
  }
  throw new InvalidOperationError(Operation.Read, "envelope radius", "no radius closes the halves' gaps");
};
