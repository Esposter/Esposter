import type { AnyHook } from "@/models/shared/AnyHook";

export interface HookRegistry<THook extends AnyHook> {
  hooks: readonly THook[];
  register: (hook: THook) => void;
  run: (...args: Parameters<THook>) => Promise<void>;
}
