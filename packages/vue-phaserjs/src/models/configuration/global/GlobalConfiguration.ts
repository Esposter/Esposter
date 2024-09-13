import type { GameObjectConfiguration } from "@/models/configuration/global/GameObjectConfiguration";
import type { TweenConfiguration } from "@/models/configuration/global/TweenConfiguration";
// These are all the configurations every game object has access to for creation in the scene
export type GlobalConfiguration = GameObjectConfiguration & TweenConfiguration;
