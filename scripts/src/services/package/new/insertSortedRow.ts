import { InvalidOperationError, Operation } from "@esposter/shared";

// Inserts a row among the rows a pattern matches, at the place its key sorts to, so a table keeps the order it has.
// A row that sorts after every match lands beneath the last of them
export const insertSortedRow = (
  text: string,
  rowPattern: RegExp,
  row: string,
  getKey: (line: string) => string,
): string => {
  const lines = text.split("\n");
  const matchingIndexes = lines.flatMap((line, index) => (rowPattern.test(line) ? [index] : []));
  const lastIndex = matchingIndexes.at(-1);
  if (lastIndex === undefined)
    throw new InvalidOperationError(Operation.Update, "package", `no row matches ${rowPattern.source}`);

  const rowKey = getKey(row);
  const nextIndex = matchingIndexes.find((index) => getKey(lines[index] ?? "") > rowKey);
  return lines.toSpliced(nextIndex ?? lastIndex + 1, 0, row).join("\n");
};
