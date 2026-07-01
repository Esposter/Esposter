/* oxlint-disable @typescript-eslint/no-unnecessary-type-assertion */
// @TODO: remove when we switch to vue-tsgo — slight difference between ts6 and tsgo (ts7) behaviour
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

export const InjectionKeyMap = {
  ParentContainer: Symbol("ParentContainer") as InjectionKey<Ref<GameObjects.Container | undefined>>,
  SceneKey: Symbol("SceneKey") as InjectionKey<SceneWithPlugins["scene"]["key"]>,
} as const satisfies Record<string, symbol>;
