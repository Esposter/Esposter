import type { CumulativeWeight } from "@/models/math/CumulativeWeight";
import { Operation } from "@/models/shared/Operation";
import { generateRandomNumb~/packages/shared/models/shared/Operationndom/generateRandomNumber";
import { InvalidOperationError } from "~/packages/shared/models/error/InvalidOperationError";

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
