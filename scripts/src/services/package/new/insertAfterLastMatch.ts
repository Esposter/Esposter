import { InvalidOperationError, Operation } from "@esposter/shared";

// Inserts a line beneath the last line a pattern matches. It is for a list the repository keeps in its own order.
// Such a list is not sorted, so the line goes beneath the last match
export const insertAfterLastMatch = (text: string, pattern: RegExp, line: string): string => {
  const lines = text.split("\n");
  const lastIndex = lines.findLastIndex((candidate) => pattern.test(candidate));
  if (lastIndex === -1)
    throw new InvalidOperationError(Operation.Update, "package", `no line matches ${pattern.source}`);

  return lines.toSpliced(lastIndex + 1, 0, line).join("\n");
};
