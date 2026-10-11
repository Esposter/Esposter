import type { Attribute } from "genshin-world";

// The one stat a kit's function of its striker scales with, and the share of it the function gives
export interface KitScaling {
  attribute: Attribute;
  share: number;
}
