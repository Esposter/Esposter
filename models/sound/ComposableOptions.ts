import type { SpriteMap } from "@/models/sound/SpriteMap";
import type { Except } from "@/util/types/Except";
import type { HowlOptions } from "howler";
import type { MaybeRef } from "vue";

export type ComposableOptions = {
  volume?: MaybeRef<number>;
  playbackRate?: MaybeRef<number>;
  interrupt?: boolean;
  soundEnabled?: boolean;
  autoplay?: boolean;
  sprite?: SpriteMap;
  onload?: () => void;
} & Except<HowlOptions, "src" | "volume" | "onload">;
