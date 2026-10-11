import type { SupersededPackage } from "#src/models/dependencyAdmission/SupersededPackage";

// A catalog name the map supersedes, with the successor to name in its failure
export const getSupersededCatalogEntries = (
  catalogNames: string[],
  supersededPackageMap: Record<string, SupersededPackage>,
): string[] =>
  catalogNames.flatMap((catalogName) => {
    // A catalog may name a package `constructor` or `toString`, which a plain lookup reads off the prototype
    const superseded = Object.hasOwn(supersededPackageMap, catalogName) ? supersededPackageMap[catalogName] : undefined;
    if (!superseded) return [];

    return [`${catalogName} is superseded by ${superseded.successor} (${superseded.source})`];
  });
