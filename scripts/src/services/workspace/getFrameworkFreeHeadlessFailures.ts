import type { SourceFile } from "#src/models/workspace/SourceFile";

import {
  FRAMEWORK_FREE_HEADLESS_NAME_REGEX,
  FRAMEWORK_IMPORT_REGEX,
  FRAMEWORK_PACKAGE_NAMES,
} from "#src/services/workspace/constants";

// A <thing>-headless package is a framework-free engine: its name has no Vue prefix, it declares no framework as a peer
// And it imports no framework, so the name is the only claim it makes
export const getFrameworkFreeHeadlessFailures = (
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
