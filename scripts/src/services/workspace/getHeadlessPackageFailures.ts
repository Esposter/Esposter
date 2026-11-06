import type { PackageShapeManifest } from "#src/models/workspace/PackageShapeManifest";

import { PACKAGE_JSON_FILENAME } from "#src/services/shared/constants";
import { HEADLESS_NAME_REGEX, PINIA_IMPORT_REGEX, VUE_IMPORT_REGEX } from "#src/services/workspace/constants";

// The shape every headless package holds: a Vue package named vue-<thing>-headless that imports Vue somewhere in its
// Source, exporting its entry and its manifest only, and importing no Pinia. A package that never imports Vue ships
// Nothing the name claims, so it is not named for Vue. Each breach is one message naming the package and the subpath
// Or file it breaks on, so an empty array is a pass
export const getHeadlessPackageFailures = (
  manifest: PackageShapeManifest,
  sourceFiles: { path: string; text: string }[],
): string[] => {
  const packageName = manifest.name || "(unnamed package)";
  const nameFailures = HEADLESS_NAME_REGEX.test(packageName)
    ? []
    : [`${packageName} is headless, so it must be named vue-<thing>-headless`];
  const peerFailures = Object.hasOwn(manifest.peerDependencies ?? {}, "vue")
    ? []
    : [`${packageName} is headless, so it must declare vue as a peer dependency`];
  const vueFailures = sourceFiles.some(({ text }) => VUE_IMPORT_REGEX.test(text))
    ? []
    : [`${packageName} never imports vue, so it ships no Vue abstraction for its name to claim`];
  const subpathFailures = Object.keys(manifest.exports ?? {})
    .filter((subpath) => ![".", `./${PACKAGE_JSON_FILENAME}`].includes(subpath))
    .map(
      (subpath) => `${packageName} exports ${subpath}, but a headless package exports only its entry and its manifest`,
    );
  const piniaFailures = sourceFiles
    .filter(({ text }) => PINIA_IMPORT_REGEX.test(text))
    .map(({ path }) => `${packageName} imports Pinia in ${path}, but a headless package leaves stores to the app`);
  return [...nameFailures, ...peerFailures, ...vueFailures, ...subpathFailures, ...piniaFailures];
};
