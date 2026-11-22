import { getUnitPaths } from "#src/services/sweeps/ledgerCoverage/getUnitPaths";

// Each unit's tracked files, resolved in memory. A file belongs to the deepest path naming it, so a unit's rest is the
// Files no deeper path claims, and the units being disjoint means no file is held by two of them
export const getUnitFiles = (units: readonly string[], files: readonly string[]): Map<string, string[]> => {
  const owners = new Map(units.flatMap((unit) => getUnitPaths(unit).map((path): [string, string] => [path, unit])));
  const unitFiles = new Map(units.map((unit): [string, string[]] => [unit, []]));
  for (const file of files) {
    const segments = file.split("/");
    const ancestor = Array.from({ length: segments.length }, (_segment, index) =>
      segments.slice(0, segments.length - index).join("/"),
    ).find((path) => owners.has(path));
    const owner = ancestor === undefined ? undefined : owners.get(ancestor);
    if (owner !== undefined) unitFiles.get(owner)?.push(file);
  }
  return unitFiles;
};
