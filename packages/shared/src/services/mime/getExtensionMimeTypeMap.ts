import { getMimeScore } from "#src/services/mime/getMimeScore";
import { getMimeTypeEntryMap } from "#src/services/mime/getMimeTypeEntryMap";

let extensionMimeTypeMap: ReadonlyMap<string, string> | undefined;

// Where several types claim one extension, the one scoring higher keeps it, and a tie goes to the type listed later,
// As the dataset lists them, which is the order mime-types has always resolved it in
const getPreferredMimeType = (currentMimeType: string | undefined, candidateMimeType: string): string => {
  if (currentMimeType === undefined) return candidateMimeType;

  const entryMap = getMimeTypeEntryMap();
  const currentScore = getMimeScore(currentMimeType, entryMap.get(currentMimeType)?.source);
  const candidateScore = getMimeScore(candidateMimeType, entryMap.get(candidateMimeType)?.source);
  return currentScore > candidateScore ? currentMimeType : candidateMimeType;
};

// Built once, from every type that lists an extension
export const getExtensionMimeTypeMap = (): ReadonlyMap<string, string> => {
  if (!extensionMimeTypeMap) {
    const map = new Map<string, string>();
    for (const [mimeType, { extensions = [] }] of getMimeTypeEntryMap())
      for (const extension of extensions) map.set(extension, getPreferredMimeType(map.get(extension), mimeType));
    extensionMimeTypeMap = map;
  }
  return extensionMimeTypeMap;
};
