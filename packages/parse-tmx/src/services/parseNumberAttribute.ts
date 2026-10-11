import { InvalidOperationError, Operation } from "@esposter/shared";

// An attribute left out or written empty is absent rather than zero, since `Number("")` would read it as zero
export const parseNumberAttribute = (value: string | undefined): number | undefined => {
  if (value === undefined || value === "") return undefined;
  const number = Number(value);
  if (Number.isNaN(number))
    throw new InvalidOperationError(Operation.Read, parseNumberAttribute.name, `${value} is not a number`);
  return number;
};
