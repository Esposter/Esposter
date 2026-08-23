import type { GameObjectEventEmitsOptions } from "#src/models/emit/global/GameObjectEventEmitsOptions";
import type { TweenEventEmitsOptions } from "#src/models/emit/global/TweenEventEmitsOptions";

export interface GlobalEventEmitsOptions extends GameObjectEventEmitsOptions, TweenEventEmitsOptions {}
