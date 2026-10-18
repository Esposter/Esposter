import type { LayoutItem } from "#shared/models/dashboard/data/LayoutItem";

// A cell the grid places, named by the entity it lays out
export type GridItem = LayoutItem & { id: string };
