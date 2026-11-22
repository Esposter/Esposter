import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { GameObjects } from "phaser";

const parentContainerKey: InjectionKey<Ref<GameObjects.Container | undefined>> = Symbol("ParentContainer");
const sceneKey: InjectionKey<SceneWithPlugins["scene"]["key"]> = Symbol("SceneKey");

export const InjectionKeyMap = { ParentContainer: parentContainerKey, SceneKey: sceneKey } as const satisfies Record<
  string,
  symbol
>;
