import type { Plugin } from "@oxlint/plugins";

import { requireStoreBinding } from "#src/services/oxlint/piniaStore/requireStoreBinding";
import { definePlugin } from "@oxlint/plugins";
// An oxlint JS plugin enforcing the pinia skill's rule for consuming a store: the `use*Store()` call is assigned
// To one variable named after the store, and everything else — `storeToRefs`, method destructuring — reads that
// Variable.
//
// A destructure straight off the call hides which store the names came from and, for a ref, silently drops its
// Reactivity; `storeToRefs(useFooStore())` and `useFooStore().method()` are the same shape one step removed. A
// Binding named `store`, or after half the store's name, is what the next reader has to resolve by opening the
// Import. Both findings recurred across the store and component sweeps before reaching here.
//
// The scope is the construct's domain: a call whose callee is Pinia's own `use<Name>Store` naming. The binding
// Passes when its name ends in `<Name>Store`, so a qualifier in front of the whole (`newCacheStore` beside a
// `cacheStore` in the same test) stays allowed, and a selector returning one of several stores
// (`useBattleMonsterStore(isEnemy)`) still binds `battleMonsterStore`.
const plugin: Plugin = definePlugin({
  meta: { name: "pinia-store" },
  rules: { "require-store-binding": requireStoreBinding },
});

export default plugin;
