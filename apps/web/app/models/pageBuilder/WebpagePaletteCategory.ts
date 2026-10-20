import type { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";

// A palette group: its title and the node types it lists, in the order shown
export interface WebpagePaletteCategory {
  category: string;
  types: readonly WebpageNodeType[];
}
