import type { AnyHook } from "@/models/shared/AnyHook";

export interface HookRegistry<THook extends AnyHook> {
  hooks: readonly THook[];
  // Returns the unregister, so a hook registered from a blade's scope can be dropped when that scope ends —
  // A registry is module-scoped and a remount would otherwise stack a second copy of the same hook
  register: (hook: THook) => () => void;
  run: (...args: Parameters<THook>) => Promise<void>;
}
