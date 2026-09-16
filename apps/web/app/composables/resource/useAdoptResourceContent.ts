import type { ResourceType } from "@esposter/db-schema";
import type { Promisable } from "type-fest";

import { ResourceContentHookMap } from "@/services/resource/ResourceContentHookMap";

// What a blade whose document a third-party library owns registers so a restore reaches it. Only such a blade
// Needs it: a Vue-rendered type re-renders from the ref its store refilled, where a library holds the document
// Itself and would otherwise write its pre-restore copy back (/docs/architecture/third-party-document-adapters).
// Scoped to the blade rather than to its store, because the live editor is — and the registry outlives both,
// So the unregister is what keeps a remount from stacking a second adopter over a destroyed editor. Vue's own
// Disposer rather than VueUse's forgiving one: registered past an async composable's first await there is no
// Scope left to attach to, and that is a leak worth a warning rather than a silent no-op
export const useAdoptResourceContent = (type: ResourceType, adopt: () => Promisable<void>) => {
  const unregister = ResourceContentHookMap.Adopt.register(async (reloadedType) => {
    if (reloadedType === type) await adopt();
  });
  onScopeDispose(unregister);
};
