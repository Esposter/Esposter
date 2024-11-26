import type { HookArgs } from "@/models/lifecycle/HookArgs";

import { Lifecycle } from "@/models/lifecycle/Lifecycle";
import { pushListener } from "@/util/hooks/pushListener";

export const onShutdown = (...args: HookArgs) => {
  pushListener(Lifecycle.Shutdown, ...args);
};
