import type { HookArgs } from "@/models/lifecycle/HookArgs";

import { Lifecycle } from "@/models/lifecycle/Lifecycle";
import { pushListener } from "@/utils/hooks/pushListener";

export const onPreload = (...args: HookArgs) => {
  pushListener(Lifecycle.Preload, ...args);
};