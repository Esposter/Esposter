import type { CumulativeWeight } from "@/models/math/CumulativeWeight";

import { createRandomNumber } from "@/util/math/random/createRandomNumber";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

export const getWeightedRandomValue = <T extends CumulativeWeight>(values: T[]): T => {
  if (values.length === 0)
    throw new InvalidOperationError(
      Operation.Read,
      getWeightedRandomValue.name,
      "cannot pick weighted random value from empty values",
    );

  const maxCumulativeWeight = takeOne(values, values.length - 1).cumulativeWeight;
  const randomCumulativeWeight = createRandomNumber(maxCumulativeWeight);
  // A cumulative weight is the upper bound of its own value's band, so the pick is the first band the random
  // Value falls inside. Counting the bands it is past instead lands one value short of that: every band would
  // Resolve to the value below it, and the last value could never be returned at all
  const index = values.findIndex(({ cumulativeWeight }) => cumulativeWeight > randomCumulativeWeight);
  // Every weight being zero leaves no band to fall inside, and the last value is the one that owns the top
  return takeOne(values, index === -1 ? values.length - 1 : index);
};
