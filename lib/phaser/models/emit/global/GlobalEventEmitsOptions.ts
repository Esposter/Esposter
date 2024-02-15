import { type GameObjectEventEmitsOptions } from "@/lib/phaser/models/emit/global/GameObjectEventEmitsOptions";
import { type TweenEventEmitsOptions } from "@/lib/phaser/models/emit/global/TweenEventEmitsOptions";

export type GlobalEventEmitsOptions = GameObjectEventEmitsOptions & TweenEventEmitsOptions;
