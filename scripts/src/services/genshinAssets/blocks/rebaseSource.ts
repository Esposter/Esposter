import { SOURCE_PREFIX } from "#src/services/genshinAssets/blocks/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// What follows a root in a source, as the file escapes it: AnimeStudio writes the platform's own separator, a
// Backslash on Windows
const ROOT_SEPARATORS = ["/", String.raw`\\`];

// The source of an entry's line with its shard's root swapped for the installed blocks'. A source outside the root is
// Refused: the index reads every source relative to the installed blocks, so a stray one would index as another block
export const rebaseSource = (line: string, from: string, to: string, root: string): string => {
  const start = line.indexOf(SOURCE_PREFIX) + SOURCE_PREFIX.length;
  const end = start + from.length;
  if (!line.startsWith(from, start) || !ROOT_SEPARATORS.some((separator) => line.startsWith(separator, end)))
    throw new InvalidOperationError(Operation.Read, root, `holds a source outside it: ${line.trim()}`);
  return `${line.slice(0, start)}${to}${line.slice(end)}`;
};
