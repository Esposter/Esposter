import { EXPORT_LINE_DIRECTORY_REGEX } from "#src/services/precheck/constants";

// A directory the package loads on demand has no line in its committed barrel, since the generator leaves its modules
// Out. So a directory none of whose lines the committed barrel holds is lazy: an up-to-date barrel says exactly which
// Directories are lazy, and a directory added with its barrel still stale reads as lazy too, which hides its missing
// Lines rather than inventing extra ones
export const getLazyDirectories = (fullLines: string[], committedLines: string[]): string[] => {
  const directoryLines = fullLines.flatMap((line) => {
    const directory = EXPORT_LINE_DIRECTORY_REGEX.exec(line)?.groups?.directory;
    return directory === undefined ? [] : [{ directory, line }];
  });
  return [...new Set(directoryLines.map(({ directory }) => directory))].filter((directory) =>
    directoryLines.every((entry) => entry.directory !== directory || !committedLines.includes(entry.line)),
  );
};
