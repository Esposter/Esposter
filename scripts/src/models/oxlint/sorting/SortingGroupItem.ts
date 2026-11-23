import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";

export interface SortingGroupItem extends SortingNode {
  // The group this item sorts in, as its name and as its place in the group order
  group: string;
  groupIndex: number;
}
