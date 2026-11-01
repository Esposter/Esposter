import { readValue } from "#src/services/genshinAssets/wish/readValue";
import { InvalidOperationError, Operation } from "@esposter/shared";

// A parameter a banner page must write, since a banner without it has no window, no kind or no featured items to read
export const readParameter = (parameters: Map<string, string[]>, name: string): string => {
  const value = readValue(parameters, name);
  if (value === undefined) throw new InvalidOperationError(Operation.Read, name, "is not on the page");

  return value;
};
