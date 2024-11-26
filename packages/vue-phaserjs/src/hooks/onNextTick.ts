import type { HookArgs } from "@/models/lifecycle/HookArgs";

import { Lifecycle } from "@/models/lifecycle/Lifecycle";
import { pushListener } from "@/util/hooks/pushListener";

export const onNextTick = (...args: HookArgs) => {
  pushListener(Lifecycle.NextTick, ...args);
};
