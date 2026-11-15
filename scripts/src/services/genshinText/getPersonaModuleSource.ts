const SOURCE_ALIAS = "#src/";
const COPY_ALIAS = "#src/generated/genshinText/";
const HEADER = "// Copied from `genshin-text` by `pnpm -C scripts genshin:text write`, never edited by hand\n";
// A module of `genshin-text` as the persona runs it: under the persona's own alias, headed as the copy it is
export const getPersonaModuleSource = (source: string): string =>
  `${HEADER}${source.replaceAll(`"${SOURCE_ALIAS}`, `"${COPY_ALIAS}`)}`;
