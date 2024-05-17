import type { CumulativeWeight } from "@/models/math/CumulativeWeight";
import { generateRandomNumber } from "@/util/math/random/generateRandomNumber";
import { InvalidOperationError } from "esposter-shared/models/error/InvalidOperationError";
import { Operation } from "esposter-shared/models/shared/Operation";

export const pickWeightedRandomValue = <T extends CumulativeWeight>(values: T[]) => {
  const maxCumulativeWeight = values.at(-1)?.cumulativeWeight;
  if (maxCumulativeWeight === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      pickWeightedRandomValue.name,
      "cannot pick weighted random value from empty array",
    );

  const randomCumulativeWeight = generateRandomNumber(maxCumulativeWeight);
  return values[values.filter((v) => v.cumulativeWeight <= randomCumulativeWeight).length];
};
