import type { HowlOptions } from "howler";
import type { Except } from "type-fest";
import type { MaybeRef } from "vue";

export type ComposableOptions = {
  interrupt?: boolean;
  onload?: () => void;
  rate?: MaybeRef<number>;
  soundEnabled?: boolean;
  volume?: MaybeRef<number>;
} & Except<HowlOptions, "onload" | "rate" | "src" | "volume">;
