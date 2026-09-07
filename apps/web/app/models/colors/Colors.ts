import type { UnifiedColors } from "@/models/colors/UnifiedColors";

export type Colors = {
  [P in keyof UnifiedColors]: ComputedRef<UnifiedColors[P]>;
};
