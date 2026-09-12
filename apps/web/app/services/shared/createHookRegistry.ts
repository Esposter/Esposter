import type { AnyHook } from "@/models/shared/AnyHook";
import type { HookRegistry } from "@/models/shared/HookRegistry";

import { checkIsServer } from "@esposter/shared";

// The single owner of cross-store hook plumbing — module-scoped registries outlive per-request SSR
// Store factories, so register is a client-only no-op (hooks only fire from client-side interactions)
export const createHookRegistry = <THook extends AnyHook>(): HookRegistry<THook> => {
  const hooks: THook[] = [];
  return {
    hooks,
    register: (hook) => {
      if (checkIsServer()) return;
      hooks.push(hook);
    },
    run: async (...args) => {
      await Promise.all(hooks.map((hook) => Promise.resolve(hook(...args))));
    },
  };
};
