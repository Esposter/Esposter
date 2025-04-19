import type { GameObjectEventEmitsOptions } from "@/models/emit/global/GameObjectEventEmitsOptions";
import type { TweenEventEmitsOptions } from "@/models/emit/global/TweenEventEmitsOptions";

export interface GlobalEventEmitsOptions extends GameObjectEventEmitsOptions, TweenEventEmitsOptions {}
