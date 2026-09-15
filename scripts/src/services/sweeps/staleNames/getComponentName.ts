import { posix } from "node:path";

const CASE_BOUNDARY_REGEX = /\/|(?<=[a-z\d])(?=[A-Z])/u;

// The name Nuxt registers a component under, from its path below the components directory: the folder segments
// Prefix the file name, minus the longest run of trailing folder segments the file name already opens with
// (`Message/Room/RoomHeader.vue` is `MessageRoomHeader`, `Item/Item.vue` is `Item`). The name is what a page
// Cites, and it is written in no source file — only the file name is.
export const getComponentName = (componentPath: string): string => {
  // A component at the root has the dirname `.`, which is no prefix
  const prefixParts = posix
    .dirname(componentPath)
    .split(CASE_BOUNDARY_REGEX)
    .filter((part) => part !== "." && part !== "");
  const fileNameParts = posix.basename(componentPath, ".vue").split(CASE_BOUNDARY_REGEX);
  const fileNameStart = fileNameParts.join("/").toLowerCase();
  const matchedSuffix: string[] = [];
  let keptPrefixLength = prefixParts.length;

  for (const [index, prefixPart] of prefixParts.entries().toArray().toReversed()) {
    matchedSuffix.unshift(prefixPart.toLowerCase());
    if (fileNameStart.startsWith(matchedSuffix.join("/"))) keptPrefixLength = index;
  }

  return [...prefixParts.slice(0, keptPrefixLength), ...fileNameParts].join("");
};
