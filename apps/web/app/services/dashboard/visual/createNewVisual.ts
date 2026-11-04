import type { GridCell } from "vue-grid-layout-headless";

import { Visual } from "#shared/models/dashboard/data/Visual";
import { VisualType } from "#shared/models/dashboard/data/VisualType";

// A group starts with no visuals in it, and every other type holds none, so its visuals stay absent
export const createNewVisual = (type: VisualType, cell: GridCell) =>
  new Visual({ type, ...cell, visuals: type === VisualType.Group ? [] : undefined });
