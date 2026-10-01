import type { SceneContext } from "#src/models/scene/SceneContext";
import type { InjectionKey, ShallowRef } from "vue";

// Where a scene hands a host what it renders with, once its camera exists: only the parity page provides it
export const SceneContextKey: InjectionKey<ShallowRef<SceneContext | undefined>> = Symbol("SceneContext");
