import { InvalidOperationError, Operation } from "@esposter/shared";

// Inserts a line directly above the first line a pattern matches
export const insertBeforeMatch = (text: string, pattern: RegExp, line: string): string => {
  const lines = text.split("\n");
  const index = lines.findIndex((candidate) => pattern.test(candidate));
  if (index === -1) throw new InvalidOperationError(Operation.Update, "package", `no line matches ${pattern.source}`);

  return lines.toSpliced(index, 0, line).join("\n");
};
