import { InvalidOperationError, Operation } from "@esposter/shared";

export const replaceOnce = (source: string, fileName: string, pattern: RegExp, replacement: string): string => {
  if (!pattern.test(source))
    throw new InvalidOperationError(Operation.Update, fileName, "has no copy macro to replace at this commit");
  return source.replace(pattern, replacement);
};
