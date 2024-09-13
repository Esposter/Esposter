import type { HookArgs } from "@/models/lifecycle/HookArgs";

import { Lifecycle } from "@/models/lifecycle/Lifecycle";
import { pushListener } from "@/utils/hooks/pushListener";

export const onInit = (...args: HookArgs) => {
  pushListener(Lifecycle.Init, ...args);
};
