import type { HowlOptions } from "howler";
import type { Except } from "type-fest";
import type { MaybeRef } from "vue";

export type ComposableOptions = {
  volume?: MaybeRef<number>;
  rate?: MaybeRef<number>;
  interrupt?: boolean;
  soundEnabled?: boolean;
  onload?: () => void;
} & Except<HowlOptions, "src" | "volume" | "rate" | "onload">;
