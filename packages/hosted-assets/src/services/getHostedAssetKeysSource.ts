import { renderConstant } from "#src/services/renderConstant";

// The nested constants a product's keys render as
// Each `[name, lockKey]` pair nests its name by segments and holds its lock key, which a reader looks the lock's entry up by
// The product's name prefixes them: `<name>Keys` and `<name>IndexKeys` hold the keys
// `<name>Key`, `<name>IndexKey` and `<name>KeyOf` type them by the lock keys they hold
// The header names the lock file the keys were rendered from
export const getHostedAssetKeysSource = (
  productName: string,
  lockFileName: string,
  objects: [name: string, lockKey: string][],
  indexes: [name: string, lockKey: string][],
): string => {
  const keysName = `${productName}Keys`;
  const indexKeysName = `${productName}IndexKeys`;
  return [
    "/* oxlint-disable selector-ban/no-restricted-syntax -- a mirror of the lock's keys, so each key keeps the spelling its lock entry gives it */",
    'import type { ValueOfDeep } from "type-fest";',
    "",
    "// The lock's keys as a nested constant, each path nested by its segments.",
    `// ${productName}Key is the union of its leaf paths, which readers may use to name a key.`,
    `// Generated from ${lockFileName} by the hosted-assets keys renderer; do not edit`,
    renderConstant(keysName, objects),
    "",
    renderConstant(indexKeysName, indexes),
    "",
    `export type ${productName}IndexKey = ValueOfDeep<typeof ${indexKeysName}>;`,
    `export type ${productName}Key = ValueOfDeep<typeof ${keysName}>;`,
    `export type ${productName}KeyOf<D extends keyof typeof ${keysName}> = ValueOfDeep<(typeof ${keysName})[D]>;`,
    "",
  ].join("\n");
};
