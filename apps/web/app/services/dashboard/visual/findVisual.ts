import type { Visual } from "#shared/models/dashboard/data/Visual";

import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { getEntityIdEqualComparator } from "@/services/entity/getEntityIdEqualComparator";

// The visual with the id, wherever it sits in the tree
export const findVisual = (visuals: Visual[], ids: { id: Visual["id"] }) =>
  listVisuals(visuals).find(getEntityIdEqualComparator(["id"], ids));
