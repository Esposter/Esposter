import { InvalidOperationError, Operation } from "@esposter/shared";

// Inserts an entry into the block an exact opening line starts and the first closing line after it ends.
// The entry goes where its key sorts among the block's entries
export const insertBlockEntry = (
  text: string,
  opening: string,
  closing: RegExp,
  entry: string,
  getKey: (line: string) => string,
): string => {
  const lines = text.split("\n");
  const openingIndex = lines.indexOf(opening);
  const closingIndex = lines.findIndex((line, index) => index > openingIndex && closing.test(line));
  if (openingIndex === -1 || closingIndex === -1)
    throw new InvalidOperationError(Operation.Update, "package", `no block opens at ${opening}`);

  const entryKey = getKey(entry);
  const nextIndex = lines.findIndex(
    (line, index) => index > openingIndex && index < closingIndex && getKey(line) > entryKey,
  );
  return lines.toSpliced(nextIndex === -1 ? closingIndex : nextIndex, 0, entry).join("\n");
};
