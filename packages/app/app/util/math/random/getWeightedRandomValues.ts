import type { CumulativeWeight } from "@/models/math/CumulativeWeight";

import { createRandomNumber } from "#shared/util/math/random/createRandomNumber";
import { InvalidOperationError, Operation } from "@esposter/shared";

export const getWeightedRandomValue = <T extends CumulativeWeight>(values: T[]) => {
  if (values.length === 0)
    throw new InvalidOperationError(
      Operation.Read,
      getWeightedRandomValue.name,
      "Cannot pick weighted random value from empty array",
    );

  const maxCumulativeWeight = values[values.length - 1].cumulativeWeight;
  const randomCumulativeWeight = createRandomNumber(maxCumulativeWeight);
  return values[values.filter(({ cumulativeWeight }) => cumulativeWeight <= randomCumulativeWeight).length];
};
