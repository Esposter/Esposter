import { posix } from "node:path";

const CASE_BOUNDARY_REGEX = /\/|(?<=[a-z\d])(?=[A-Z])/u;
// The name Nuxt registers a component under, from its path below the components directory: the folder segments
// Prefix the file name, minus the longest run of trailing folder segments the file name already opens with
// (`Message/Room/RoomHeader.vue` is `MessageRoomHeader`, `Item/Item.vue` and `Item/Index.vue` are `Item`). The name is
// What a page cites, and it is written in no source file — only the file name is.
export const getComponentName = (componentPath: string): string => {
  // A component at the root has the dirname `.`, which is no prefix
  const prefixParts = posix
    .dirname(componentPath)
    .split(CASE_BOUNDARY_REGEX)
    .filter((part) => part !== "." && part !== "");
  const fileName = posix.basename(componentPath, ".vue");
  // An index file takes its folder's name, so it adds no part of its own
  const fileNameParts = fileName.toLowerCase() === "index" ? [] : fileName.split(CASE_BOUNDARY_REGEX);
  const fileNameStart = fileNameParts.join("/").toLowerCase();
  const matchedSuffix: string[] = [];
  let keptPrefixLength = prefixParts.length;

  for (const [index, prefixPart] of prefixParts.entries().toArray().toReversed()) {
    matchedSuffix.unshift(prefixPart.toLowerCase());
    if (fileNameStart.startsWith(matchedSuffix.join("/"))) keptPrefixLength = index;
  }

  return [...prefixParts.slice(0, keptPrefixLength), ...fileNameParts].join("");
};
