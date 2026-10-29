import { EXPORT_LINE_DIRECTORY_REGEX } from "#src/services/precheck/constants";

// The lines a package's source barrel holds: the generator's, minus the modules under its lazy directories, which the
// Generator itself leaves out of the barrel
export const getExpectedLines = (fullLines: string[], lazyDirectories: string[]): string[] =>
  fullLines.filter(
    (line) => !lazyDirectories.includes(EXPORT_LINE_DIRECTORY_REGEX.exec(line)?.groups?.directory ?? ""),
  );
