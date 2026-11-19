interface DisplacedIndex {
  actualIndex: number;
  expectedIndex: number;
  sourceIndex: number;
}

// The entry that landed furthest from where it was expected. A tie keeps the first, and nothing that moved answers undefined
export const findLargestDisplacement = (displacedIndexes: DisplacedIndex[]) => {
  let largest: DisplacedIndex | undefined;
  let maxDisplacement = 0;
  for (const displacedIndex of displacedIndexes) {
    const displacement = Math.abs(displacedIndex.actualIndex - displacedIndex.expectedIndex);
    if (displacement > maxDisplacement) {
      maxDisplacement = displacement;
      largest = displacedIndex;
    }
  }
  return largest;
};
