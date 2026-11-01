import { InvalidOperationError, Operation } from "@esposter/shared";

export const replaceOnce = (source: string, pattern: RegExp, replacement: string): string => {
  if (!pattern.test(source))
    throw new InvalidOperationError(Operation.Update, "kraken.cpp", "has no copy macro to replace at this commit");
  return source.replace(pattern, replacement);
};
