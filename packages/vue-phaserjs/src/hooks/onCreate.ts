import type { HookArgs } from "@/models/lifecycle/HookArgs";

import { Lifecycle } from "@/models/lifecycle/Lifecycle";
import { pushListener } from "@/util/hooks/pushListener";

export const onCreate = (...args: HookArgs) => {
  pushListener(Lifecycle.Create, ...args);
};
