import type { GridItem } from "@/models/dashboard/GridItem";
import type { Visual } from "#shared/models/dashboard/data/Visual";

// A grid cell carrying the visual it draws, so a placed copy of the layout still says which visual each cell is
export type GridTile = GridItem & { visual: Visual };
