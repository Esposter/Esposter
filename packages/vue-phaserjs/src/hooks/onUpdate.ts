import type { HookArgs } from "#src/models/lifecycle/HookArgs";

import { Lifecycle } from "#src/models/lifecycle/Lifecycle";
import { pushListener } from "#src/util/hooks/pushListener";

export const onUpdate = (...args: HookArgs) => {
  pushListener(Lifecycle.Update, ...args);
};
