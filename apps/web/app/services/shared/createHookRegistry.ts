import type { AnyHook } from "@/models/shared/AnyHook";
import type { HookRegistry } from "@/models/shared/HookRegistry";

import { checkIsServer, noop } from "@esposter/shared";

// The single owner of cross-store hook plumbing — module-scoped registries outlive per-request SSR
// Store factories, so register is a client-only no-op (hooks only fire from client-side interactions)
export const createHookRegistry = <THook extends AnyHook>(): HookRegistry<THook> => {
  const hooks: THook[] = [];
  return {
    hooks,
    register: (hook) => {
      if (checkIsServer()) return noop;

      hooks.push(hook);
      // The index is checked because `splice(-1, 1)` drops the last hook instead of nothing, so an unregister
      // Called twice would tear down whichever blade registered most recently
      return () => {
        const index = hooks.indexOf(hook);
        if (index !== -1) hooks.splice(index, 1);
      };
    },
    run: async (...args) => {
      await Promise.all(hooks.map((hook) => Promise.resolve(hook(...args))));
    },
  };
};
