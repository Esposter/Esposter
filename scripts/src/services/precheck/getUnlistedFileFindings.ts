// Each tracked file no unit of the partition holds. A file no row names is read by no question and sized by no check,
// And It reads exactly like a swept one, so a new file, or one a rename moved out of its unit's paths, is named until a
// Row Holds it. `unitFiles` is the partition's files per unit, which the caller resolves once for every check it runs
export const getUnlistedFileFindings = (
  unitFiles: ReadonlyMap<string, readonly string[]>,
  trackedFiles: readonly string[],
): string[] => {
  const heldFiles = new Set([...unitFiles.values()].flat());
  return trackedFiles
    .filter((file) => !heldFiles.has(file))
    .map((file) => `unlisted ${file}: no unit of the area list holds it, so list it in a row of its area`);
};
