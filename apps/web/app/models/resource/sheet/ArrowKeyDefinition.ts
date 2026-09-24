import type { UiIconMeaning } from "@/models/ui/UiIconMeaning";

export interface ArrowKeyDefinition {
  // The step the key takes across the grid, as a row delta then a column delta
  delta: readonly [number, number];
  direction: string;
  meaning: UiIconMeaning;
}
