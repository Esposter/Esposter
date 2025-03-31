import type { CumulativeWeight } from "@/models/math/CumulativeWeight";

import { createRandomNumber } from "#shared/util/math/random/createRandomNumber";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const getWeightedRandomValue = <T extends CumulativeWeight>(values: T[]) => {
  const maxCumulativeWeight = values.at(-1)?.cumulativeWeight;
  if (maxCumulativeWeight === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      getWeightedRandomValue.name,
      "cannot pick weighted random value from empty array",
    );

  const randomCumulativeWeight = createRandomNumber(maxCumulativeWeight);
  return values[values.filter(({ cumulativeWeight }) => cumulativeWeight <= randomCumulativeWeight).length];
};
