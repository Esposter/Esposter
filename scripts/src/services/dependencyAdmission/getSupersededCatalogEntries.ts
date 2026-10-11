import type { SupersededPackage } from "#src/models/dependencyAdmission/SupersededPackage";

// A catalog name the map supersedes, with the successor to name in its failure
export const getSupersededCatalogEntries = (
  catalogNames: string[],
  supersededPackageMap: Record<string, SupersededPackage>,
): string[] =>
  catalogNames.flatMap((catalogName) => {
    // A catalog may name a package `constructor` or `toString`, which a plain lookup reads off the prototype
    if (!Object.hasOwn(supersededPackageMap, catalogName)) return [];
    const superseded = supersededPackageMap[catalogName];

    return [`${catalogName} is superseded by ${superseded.successor} (${superseded.source})`];
  });
