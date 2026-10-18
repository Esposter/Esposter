import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { GridItem } from "vue-grid-layout-headless";

// A grid cell carrying the visual it draws, so a placed copy of the layout still says which visual each cell is
export type GridTile = GridItem & { visual: Visual };
