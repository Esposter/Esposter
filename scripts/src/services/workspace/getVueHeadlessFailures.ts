import type { SourceFile } from "#src/models/workspace/SourceFile";

import {
  PINIA_IMPORT_REGEX,
  VUE_HEADLESS_NAME_REGEX,
  VUE_IMPORT_REGEX,
  VUE_PACKAGE_NAME,
} from "#src/services/workspace/constants";

// A vue-<thing>-headless package is a Vue package: it names itself with the Vue prefix, declares Vue as a peer, imports
// Vue somewhere in its source and imports no Pinia
export const getVueHeadlessFailures = (
  packageName: string,
  peerNames: string[],
  sourceFiles: SourceFile[],
): string[] => {
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
