import type { PaletteItem } from "#src/models/ui/palette/PaletteItem";

export interface PaletteGroup {
  items: PaletteItem[];
  title: string;
}
