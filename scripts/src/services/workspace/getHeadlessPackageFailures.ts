import type { PackageShapeManifest } from "#src/models/workspace/PackageShapeManifest";
import type { SourceFile } from "#src/models/workspace/SourceFile";

import { PACKAGE_JSON_FILENAME } from "#src/services/shared/constants";
import { UNNAMED_PACKAGE_NAME, VUE_PACKAGE_PREFIX } from "#src/services/workspace/constants";
import { getFrameworkFreeHeadlessFailures } from "#src/services/workspace/getFrameworkFreeHeadlessFailures";
import { getVueHeadlessFailures } from "#src/services/workspace/getVueHeadlessFailures";

// The shape every headless package holds, in one of two kinds the name tells apart: a vue-<thing>-headless Vue package,
// Or a framework-free <thing>-headless engine. Both export their entry and their manifest only. Each breach is one
// Message naming the package and the file or subpath it breaks on, so an empty array is a pass
export const getHeadlessPackageFailures = (manifest: PackageShapeManifest, sourceFiles: SourceFile[]): string[] => {
  const packageName = manifest.name || UNNAMED_PACKAGE_NAME;
  const peerNames = Object.keys(manifest.peerDependencies ?? {});
  const kindFailures = packageName.startsWith(VUE_PACKAGE_PREFIX)
    ? getVueHeadlessFailures(packageName, peerNames, sourceFiles)
    : getFrameworkFreeHeadlessFailures(packageName, peerNames, sourceFiles);
  const subpathFailures = Object.keys(manifest.exports ?? {})
    .filter((subpath) => ![".", `./${PACKAGE_JSON_FILENAME}`].includes(subpath))
    .map(
      (subpath) => `${packageName} exports ${subpath}, but a headless package exports only its entry and its manifest`,
    );
  return [...kindFailures, ...subpathFailures];
};
