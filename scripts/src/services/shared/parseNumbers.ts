import { InvalidOperationError, Operation } from "@esposter/shared";

// A command line's comma-separated numbers, the argument named rejected rather than read as something it never said:
// An empty or non-numeric entry, which `Number` reads as 0 or NaN, and a count other than the one given
export const parseNumbers = (value: string, name: string, count?: number): number[] => {
  const entries = value.split(",");
  if (count !== undefined && entries.length !== count)
    throw new InvalidOperationError(Operation.Read, name, `${value} is not ${count} comma-separated numbers`);
  return entries.map((entry) => {
    const number = Number(entry);
    if (entry.trim() === "" || !Number.isFinite(number))
      throw new InvalidOperationError(
        Operation.Read,
        name,
        `${value} holds ${entry || "an empty entry"}, not a number`,
      );
    return number;
  });
};
