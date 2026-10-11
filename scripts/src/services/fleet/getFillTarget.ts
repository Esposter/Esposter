import { FLEET_FILL_MAX_TARGET } from "#src/services/fleet/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The live claims this machine keeps: the `--target` given, or when none is, its logical core count capped at the maximum
export const getFillTarget = (value: string, coreCount: number): number => {
  if (value === "") return Math.min(coreCount, FLEET_FILL_MAX_TARGET);
  const target = Number(value);
  if (!Number.isInteger(target) || target < 0)
    throw new InvalidOperationError(Operation.Read, "--target", `${value} is not a whole number of claims`);
  return target;
};
