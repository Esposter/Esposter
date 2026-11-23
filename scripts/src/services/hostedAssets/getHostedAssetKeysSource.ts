import { renderConstant } from "#src/services/hostedAssets/renderConstant";

// The nested constants a product's keys render as. Each `[name, lockKey]` pair nests its name by segments and holds its
// Lock key, which a reader looks the lock's entry up by. The product's name prefixes them: `<name>Keys` and `<name>IndexKeys`
// Hold the keys, and `<name>Key`, `<name>IndexKey` and `<name>KeyOf` type them by the lock keys they hold
export const getHostedAssetKeysSource = (
  productName: string,
  objects: [name: string, lockKey: string][],
  indexes: [name: string, lockKey: string][],
): string => {
  const keysName = `${productName}Keys`;
  const indexKeysName = `${productName}IndexKeys`;
  const lockFileName = `${productName.charAt(0).toLowerCase()}${productName.slice(1)}Lock.json`;
  return [
    "/* oxlint-disable selector-ban/no-restricted-syntax -- a mirror of the lock's own keys, which a reader looks up by a dataset's name at runtime, so a key keeps the spelling the data gives it */",
    'import type { ValueOfDeep } from "type-fest";',
    "",
    "// The lock's keys as a nested constant, each path nested by its segments.",
    `// ${productName}Key is the union of its leaf paths, which readers may use to name a key.`,
    `// Generated from ${lockFileName} on every publish.`,
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
