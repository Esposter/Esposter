// The packages naming `name`, one entry each. The caller drops the defining **package** first, not merely the
// Defining file: a second file in `packages/shared` naming the export is the library using itself, and counting
// It as a consumer lets one real consumer clear a threshold that asks for two.
export const getConsumerPackagePaths = (
  name: string,
  packageIdentifiersMap: ReadonlyMap<string, ReadonlySet<string>>,
): string[] =>
  packageIdentifiersMap
    .entries()
    .filter(([, identifiers]) => identifiers.has(name))
    .map(([packagePath]) => packagePath)
    .toArray();
