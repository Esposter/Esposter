import type { HowlOptions } from "howler";
import type { Except } from "type-fest";
import type { MaybeRef } from "vue";

export type ComposableOptions = Except<HowlOptions, "onload" | "rate" | "src" | "volume"> & {
  interrupt?: boolean;
  onload?: () => void;
  rate?: MaybeRef<number>;
  soundEnabled?: boolean;
  volume?: MaybeRef<number>;
};
