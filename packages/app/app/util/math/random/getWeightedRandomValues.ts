import type { CumulativeWeight } from "@/models/math/CumulativeWeight";

import { createRandomNumber } from "#shared/util/math/random/createRandomNumber";
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
  return takeOne(
    values,
    values.filter(({ cumulativeWeight }) => cumulativeWeight <= randomCumulativeWeight).length - 1,
  );
};
