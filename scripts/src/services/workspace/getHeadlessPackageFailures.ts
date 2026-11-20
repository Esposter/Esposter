import type { PackageShapeManifest } from "#src/models/workspace/PackageShapeManifest";
import type { SourceFile } from "#src/models/workspace/SourceFile";

import { PACKAGE_JSON_FILENAME } from "#src/services/shared/constants";
import {
  FRAMEWORK_FREE_HEADLESS_NAME_REGEX,
  FRAMEWORK_IMPORT_REGEX,
  FRAMEWORK_PACKAGE_NAMES,
  PINIA_IMPORT_REGEX,
  VUE_HEADLESS_NAME_REGEX,
  VUE_IMPORT_REGEX,
  VUE_PACKAGE_NAME,
  VUE_PACKAGE_PREFIX,
} from "#src/services/workspace/constants";

// A vue-<thing>-headless package is a Vue package: it names itself with the Vue prefix, declares Vue as a peer, imports
// Vue somewhere in its source and imports no Pinia
const getVueHeadlessFailures = (packageName: string, peerNames: string[], sourceFiles: SourceFile[]): string[] => {
  const nameFailures = VUE_HEADLESS_NAME_REGEX.test(packageName)
    ? []
    : [`${packageName} is headless, so it must be named vue-<thing>-headless`];
  const peerFailures = peerNames.includes(VUE_PACKAGE_NAME)
    ? []
    : [`${packageName} is headless, so it must declare vue as a peer dependency`];
  const vueFailures = sourceFiles.some(({ text }) => VUE_IMPORT_REGEX.test(text))
    ? []
    : [`${packageName} never imports vue, so it ships no Vue abstraction for its name to claim`];
  const piniaFailures = sourceFiles
    .filter(({ text }) => PINIA_IMPORT_REGEX.test(text))
    .map(({ path }) => `${packageName} imports Pinia in ${path}, but a headless package leaves stores to the app`);
  return [...nameFailures, ...peerFailures, ...vueFailures, ...piniaFailures];
};

// A <thing>-headless package is a framework-free engine: its name has no Vue prefix, it declares no framework as a peer
// And it imports no framework, so the name is the only claim it makes
const getFrameworkFreeHeadlessFailures = (
  packageName: string,
  peerNames: string[],
  sourceFiles: SourceFile[],
): string[] => {
  const nameFailures = FRAMEWORK_FREE_HEADLESS_NAME_REGEX.test(packageName)
    ? []
    : [`${packageName} is headless without a vue- prefix, so it must be named <thing>-headless`];
  const peerFailures = peerNames
    .filter((peerName) => FRAMEWORK_PACKAGE_NAMES.includes(peerName))
    .map(
      (peerName) =>
        `${packageName} is a framework-free headless package, so it declares no framework peer, but declares ${peerName} as a peer dependency`,
    );
  const importFailures = sourceFiles
    .filter(({ text }) => FRAMEWORK_IMPORT_REGEX.test(text))
    .map(
      ({ path }) =>
        `${packageName} is a framework-free headless package, so it imports no framework, but ${path} imports one`,
    );
  return [...nameFailures, ...peerFailures, ...importFailures];
};

// The shape every headless package holds, in one of two kinds the name tells apart: a vue-<thing>-headless Vue package,
// Or a framework-free <thing>-headless engine. Both export their entry and their manifest only. Each breach is one
// Message naming the package and the file or subpath it breaks on, so an empty array is a pass
export const getHeadlessPackageFailures = (manifest: PackageShapeManifest, sourceFiles: SourceFile[]): string[] => {
  const packageName = manifest.name || "(unnamed package)";
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
