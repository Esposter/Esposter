import type { AnyHook } from "@/models/shared/AnyHook";
import type { HookRegistry } from "@/models/shared/HookRegistry";

import { checkIsServer, noop } from "@esposter/shared";

// The single owner of cross-store hook plumbing — module-scoped registries outlive per-request SSR
// Store factories, so register is a client-only no-op (hooks only fire from client-side interactions)
export const createHookRegistry = <THook extends AnyHook>(): HookRegistry<THook> => {
  // Replaced rather than mutated, so a loop already walking the list keeps the one it started with, and an unregister
  // Made inside a hook cannot skip the hook after it
  let hooks: THook[] = [];
  return {
    get hooks() {
      return hooks;
    },
    register: (hook) => {
      if (checkIsServer()) return noop;

      hooks = [...hooks, hook];
      // The index is checked because `toSpliced(-1, 1)` drops the last hook instead of nothing, so an unregister
      // Called twice would tear down whichever blade registered most recently
      return () => {
        const index = hooks.indexOf(hook);
        if (index !== -1) hooks = hooks.toSpliced(index, 1);
      };
    },
    run: async (...args) => {
      await Promise.all(hooks.map((hook) => Promise.resolve(hook(...args))));
    },
  };
};
