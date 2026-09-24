import { CASE_BOUNDARY_REGEX, NAME_SEPARATOR_REGEX } from "@@/scripts/flowMap/constants";
import { basename, dirname, extname } from "node:path";

const splitByCase = (value: string) =>
  value
    .split(NAME_SEPARATOR_REGEX)
    .flatMap((part) => part.split(CASE_BOUNDARY_REGEX))
    .filter(Boolean);
// Nuxt's own naming (getNameFromPath in nuxt's core utils), which drops a folder prefix the file name repeats, lowered
// And joined so a PascalCase tag and a kebab-case one resolve to the same key
export const getComponentKey = (relativePath: string) => {
  const prefixParts = splitByCase(dirname(relativePath));
  const fileName = basename(relativePath, extname(relativePath));
  const fileNameParts = splitByCase(fileName.toLowerCase() === "index" ? "" : fileName);
  const fileNamePartsContent = fileNameParts.join("/").toLowerCase();
  const repeatedPrefixIndex = prefixParts.findIndex((prefixPart, index) => {
    const matchedSuffixContent = prefixParts
      .slice(index)
      .map((part) => part.toLowerCase())
      .join("/");
    return (
      fileNamePartsContent === matchedSuffixContent ||
      fileNamePartsContent.startsWith(`${matchedSuffixContent}/`) ||
      (prefixPart.toLowerCase() === fileNamePartsContent && prefixPart === prefixParts[index + 1])
    );
  });
  const componentNameParts = repeatedPrefixIndex === -1 ? prefixParts : prefixParts.slice(0, repeatedPrefixIndex);
  return [...componentNameParts, ...fileNameParts].join("").toLowerCase();
};
