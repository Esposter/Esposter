import type { Promisable } from "type-fest";

import { getIsServer } from "@esposter/shared";

export interface HookRegistry<THook extends AnyHook> {
  hooks: readonly THook[];
  register: (hook: THook) => void;
  run: (...args: Parameters<THook>) => Promise<void>;
}

type AnyHook = (...args: never[]) => Promisable<void>;
// The single owner of cross-store hook plumbing — module-scoped registries outlive per-request SSR
// Store factories, so register is a client-only no-op (hooks only fire from client-side interactions)
export const createHookRegistry = <THook extends AnyHook>(): HookRegistry<THook> => {
  const hooks: THook[] = [];
  return {
    hooks,
    register: (hook) => {
      if (getIsServer()) return;
      hooks.push(hook);
    },
    run: async (...args) => {
      await Promise.all(hooks.map((hook) => Promise.resolve(hook(...args))));
    },
  };
};
