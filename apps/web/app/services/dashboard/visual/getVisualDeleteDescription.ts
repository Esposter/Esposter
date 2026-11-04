import type { Visual } from "#shared/models/dashboard/data/Visual";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { listVisuals } from "#shared/services/dashboard/listVisuals";
import { pluralize } from "#shared/util/text/pluralize";

// What the delete confirm says of a visual. A group names itself and counts every visual of its tree, since all of them go
export const getVisualDeleteDescription = (visual: Visual) => {
  if (visual.type !== VisualType.Group) return "Delete this visual from the dashboard?";

  const name = visual.chart.configuration.title ? `the group "${visual.chart.configuration.title}"` : "this group";
  const innerCount = listVisuals(visual.visuals ?? []).length;
  return innerCount === 0
    ? `Delete ${name} from the dashboard?`
    : `Delete ${name} from the dashboard, and ${innerCount} ${pluralize("visual", innerCount)} inside?`;
};
