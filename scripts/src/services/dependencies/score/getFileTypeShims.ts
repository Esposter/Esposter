import { SHIM_LINE_WINDOW } from "#src/services/dependencies/score/constants";
import { getImportedPackageName } from "#src/services/dependencies/score/parseImportLines";

// A single-line import with the bindings it names. A multi-line import is not read, so a call beside it is not matched.
const IMPORT_REGEX = /^\s*import\s+(?:type\s+)?(?<bindings>.*?)\s*from\s*"(?<specifier>[^"]+)"/u;
const DECLARE_MODULE_REGEX = /^\s*declare module "(?<specifier>[^"]+)"/u;
const EXPECT_ERROR = "@ts-expect-error";
const UNKNOWN_CAST = "as unknown as";

interface ImportLine {
  bindingNames: string[];
  index: number;
  packageName: string;
}

// The local names an import's bindings introduce, whether `a`, `b as c`, `* as ns` or `Default, { x }`
const getBindingNames = (bindings: string): string[] =>
  bindings
    .replaceAll(/[{}*]/gu, " ")
    .split(",")
    .flatMap((part) => {
      const words = part
        .trim()
        .split(/\s+/u)
        .filter((word) => word !== "" && word !== "as" && word !== "type");
      const name = words.at(-1);
      return name === undefined ? [] : [name];
    });

const readImportLines = (lines: string[]): ImportLine[] =>
  lines.flatMap((line, index) => {
    const groups = IMPORT_REGEX.exec(line)?.groups;
    if (groups?.specifier === undefined) return [];

    return [
      {
        bindingNames: getBindingNames(groups.bindings ?? ""),
        index,
        packageName: getImportedPackageName(groups.specifier),
      },
    ];
  });

// Every package imported within the window of a directive, since the directive is for the error at that import
const getNearbyPackageNames = (importLines: ImportLine[], index: number): Set<string> =>
  new Set(
    importLines
      .filter((importLine) => Math.abs(importLine.index - index) <= SHIM_LINE_WINDOW)
      .map(({ packageName }) => packageName),
  );

// Every package whose imported name is called or read from within the window of a cast. The lookbehind stands in for `\b`,
// Which a name starting with `$` never satisfies beside a space
const getCalledPackageNames = (lines: string[], importLines: ImportLine[], index: number): Set<string> => {
  const windowText = lines.slice(Math.max(0, index - SHIM_LINE_WINDOW), index + SHIM_LINE_WINDOW + 1).join("\n");
  return new Set(
    importLines
      .filter(({ bindingNames }) =>
        bindingNames.some((bindingName) =>
          new RegExp(String.raw`(?<![\w$])${RegExp.escape(bindingName)}\s*[(.]`, "u").test(windowText),
        ),
      )
      .map(({ packageName }) => packageName),
  );
};

// The type workarounds a file holds, counted per package: each module declared over one, and each directive or cast that
// Sits beside one of its imports or calls. A line counts once per package it touches.
export const getFileTypeShims = (text: string): Map<string, number> => {
  const lines = text.split("\n");
  const importLines = readImportLines(lines);
  const packageNameCountMap = new Map<string, number>();
  const countShim = (packageName: string): void => {
    packageNameCountMap.set(packageName, (packageNameCountMap.get(packageName) ?? 0) + 1);
  };
  const countShims = (packageNames: Set<string>): void => {
    for (const packageName of packageNames) countShim(packageName);
  };

  for (const [index, line] of lines.entries()) {
    const declaredSpecifier = DECLARE_MODULE_REGEX.exec(line)?.groups?.specifier;
    if (declaredSpecifier !== undefined) countShim(getImportedPackageName(declaredSpecifier));
    if (line.includes(EXPECT_ERROR)) countShims(getNearbyPackageNames(importLines, index));
    if (line.includes(UNKNOWN_CAST)) countShims(getCalledPackageNames(lines, importLines, index));
  }

  return packageNameCountMap;
};
