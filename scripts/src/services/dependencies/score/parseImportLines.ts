// One `git grep -o -n` line is `<path>:<line>:<match>`, the match being `from "<specifier>"` or `import("<specifier>"`
const IMPORT_LINE_REGEX = /^(?<path>[^:\n]+):\d+:.*"(?<specifier>[^"\n]+)"/gmu;

// A specifier's package: its first segment, or the first two for a scoped name, so a subpath counts toward its package
export const getImportedPackageName = (specifier: string): string => {
  const segments = specifier.split("/");
  return specifier.startsWith("@") ? segments.slice(0, 2).join("/") : (segments[0] ?? "");
};

// Every package's importing files, each counted once however many of its imports the file holds
export const parseImportLines = (output: string): Map<string, Set<string>> => {
  const packageNamePathsMap = new Map<string, Set<string>>();

  for (const { groups } of output.matchAll(IMPORT_LINE_REGEX)) {
    if (!groups?.path || !groups.specifier) continue;

    const packageName = getImportedPackageName(groups.specifier);
    const paths = packageNamePathsMap.get(packageName) ?? new Set<string>();
    paths.add(groups.path);
    packageNamePathsMap.set(packageName, paths);
  }

  return packageNamePathsMap;
};
