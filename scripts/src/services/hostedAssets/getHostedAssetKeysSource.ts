import type { HostedAssetLock } from "hosted-assets";

import { renderConstant } from "#src/services/hostedAssets/renderConstant";

// The nested constants a product's lock keys render as, each key's type the leaf of its path. The product's name prefixes
// Them: `<name>Keys` and `<name>IndexKeys` hold the keys, and `<name>Key`, `<name>IndexKey` and `<name>KeyOf` type them
export const getHostedAssetKeysSource = (productName: string, lock: HostedAssetLock): string => {
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
    renderConstant(keysName, Object.keys(lock.objects)),
    "",
    renderConstant(indexKeysName, Object.keys(lock.indexes)),
    "",
    `export type ${productName}IndexKey = ValueOfDeep<typeof ${indexKeysName}>;`,
    `export type ${productName}Key = ValueOfDeep<typeof ${keysName}>;`,
    `export type ${productName}KeyOf<D extends keyof typeof ${keysName}> = ValueOfDeep<(typeof ${keysName})[D]>;`,
    "",
  ].join("\n");
};
