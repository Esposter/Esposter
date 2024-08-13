import type { HookArgs } from "@/lib/phaser/models/lifecycle/HookArgs";

import { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import { pushListener } from "@/lib/phaser/util/hooks/pushListener";

export const onUpdate = (...args: HookArgs) => {
  pushListener(Lifecycle.Update, ...args);
};
