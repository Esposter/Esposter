import type { SceneLifecycleHooks } from "@/models/scene/SceneLifecycleHooks";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { Lifecycle } from "@/models/lifecycle/Lifecycle";
import { runLifecycleListeners } from "@/util/hooks/runLifecycleListeners";
import { Scene } from "phaser";

export const createSceneClass = (key: string, hooks: SceneLifecycleHooks = {}) =>
  class extends Scene {
    constructor() {
      super({ key });
    }

    create(this: SceneWithPlugins) {
      hooks.onCreate?.(this);
      runLifecycleListeners(this, Lifecycle.Create);
    }

    init(this: SceneWithPlugins) {
      hooks.onInit?.(this);
      runLifecycleListeners(this, Lifecycle.Init);
    }

    preload(this: SceneWithPlugins) {
      hooks.onPreload?.(this);
      runLifecycleListeners(this, Lifecycle.Preload);
    }

    override update(this: SceneWithPlugins, time: number, delta: number) {
      hooks.onUpdate?.(this, time, delta);
      runLifecycleListeners(this, Lifecycle.Update, false);
      runLifecycleListeners(this, Lifecycle.NextTick);
    }
  };
