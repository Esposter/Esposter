import type { SampleLibrary } from "#src/models/genshinAssets/shared/SampleLibrary";

import { fetchSampleFile } from "#src/services/genshinAssets/music/fetchSampleFile";
import { readFile } from "node:fs/promises";
import { posix } from "node:path";

const INCLUDE_REGEX = /^[^\S\n]*#include[^\S\n]+"(?<path>[^"]+)"/gmu;
// A mapping's text with every file it includes read into its place, each include's path taken from the folder of the
// Mapping first read, as SFZ resolves them, so a sample path in an included file is from that folder too. A file
// Included more than once is read once, since two fetches of one file at once would race for its place in the cache
export const readSfzMapping = async (
  library: SampleLibrary,
  mapping: string,
  directory: string = posix.dirname(mapping),
): Promise<string> => {
  const text = await readFile(await fetchSampleFile(library, mapping), "utf8");
  const getIncludedPath = (path: string): string => posix.join(directory, path.replaceAll("\\", "/"));
  const includedPaths = new Set(
    Array.from(text.matchAll(INCLUDE_REGEX), ({ groups }) => getIncludedPath(groups?.path ?? "")),
  );
  const includedTextMap = new Map(
    await Promise.all(
      Array.from(includedPaths, async (path) => [path, await readSfzMapping(library, path, directory)] as const),
    ),
  );
  return text.replaceAll(INCLUDE_REGEX, (_include, path: string) => includedTextMap.get(getIncludedPath(path)) ?? "");
};
