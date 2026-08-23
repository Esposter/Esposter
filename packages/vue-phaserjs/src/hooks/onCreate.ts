import type { HookArgs } from "#src/models/lifecycle/HookArgs";

import { Lifecycle } from "#src/models/lifecycle/Lifecycle";
import { pushListener } from "#src/util/hooks/pushListener";

export const onCreate = (...args: HookArgs) => {
  pushListener(Lifecycle.Create, ...args);
};
