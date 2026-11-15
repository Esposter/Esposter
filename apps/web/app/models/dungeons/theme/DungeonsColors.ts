import type { Theme } from "#src/models/dungeons/theme/Theme";

export type DungeonsColors = {
  [P in keyof Theme]: ComputedRef<Theme[P]>;
};
