const SOURCE_ALIAS = "#src/";
const COPY_ALIAS = "#src/generated/genshinText/";
const HEADER = "// Copied from `genshin-text` by `pnpm -C scripts genshin:text write`, never edited by hand\n";
const ENUM_PATTERN = /export enum (\w+) \{\n([\s\S]*?)\n\}/g;
// The persona runs under plain `node`, which strips types and takes no `enum`, so each enum becomes a const object
// Of the same members and a type of the same name, which every use of the enum reads the same way
const toConstObject = (_: string, name: string, body: string): string =>
  [
    `export const ${name} = {`,
    body.replaceAll(/^(\s*)(\w+) = (.+),$/gm, "$1$2: $3,"),
    "} as const;",
    "",
    `export type ${name} = (typeof ${name})[keyof typeof ${name}];`,
  ].join("\n");
// A module of `genshin-text` as the persona runs it: under the persona's own alias, headed as the copy it is
export const getPersonaModuleSource = (source: string): string =>
  `${HEADER}${source.replaceAll(`"${SOURCE_ALIAS}`, `"${COPY_ALIAS}`).replaceAll(ENUM_PATTERN, toConstObject)}`;
