import { readAbyssFloors } from "#src/services/genshinAssets/spiralAbyss/readAbyssFloors";

// The monster describes the Spiral Abyss's chambers list, in each half of each chamber, repeats included
export const readAbyssDescribeIds = (): number[] =>
  readAbyssFloors().flatMap(({ chambers }) =>
    chambers.flatMap(({ halfMonsterDescribeIds }) => halfMonsterDescribeIds.flat()),
  );
