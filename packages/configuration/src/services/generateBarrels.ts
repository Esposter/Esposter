import { generateExports } from "#src/services/generateExports";
import { getSubpathExclusions } from "#src/services/getSubpathExclusions";
import { readExportsGeneration } from "#src/services/readExportsGeneration";
import { readPackageManifest } from "#src/services/readPackageManifest";

// The barrels a package's build writes: the answer `readExportsGeneration` reads, the subpath exclusions its manifest
// Names, and the folders the caller adds, a directory the package loads on demand, which its build leaves out
export const generateBarrels = (packageDirectory: string, excludedPaths: string[] = []): void => {
  generateExports(packageDirectory, readExportsGeneration(packageDirectory), [
    ...getSubpathExclusions(readPackageManifest(packageDirectory)),
    ...excludedPaths,
  ]);
};
