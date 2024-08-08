import type { HookArgs } from "@/lib/phaser/models/lifecycle/HookArgs";

import { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import { pushListener } from "@/lib/phaser/util/hooks/pushListener";

export const onCreate = (...args: HookArgs) => {
  pushListener(Lifecycle.Create, ...args);
};
