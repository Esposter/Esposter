import type { HookArgs } from "#src/models/lifecycle/HookArgs";

import { Lifecycle } from "#src/models/lifecycle/Lifecycle";
import { pushListener } from "#src/util/hooks/pushListener";

export const onNextTick = (...args: HookArgs) => {
  pushListener(Lifecycle.NextTick, ...args);
};
