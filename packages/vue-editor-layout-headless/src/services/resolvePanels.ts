import type { Context } from "#src/models/Context";
import type { Panel } from "#src/models/Panel";
import type { Region } from "#src/models/Region";
import type { ResolvedPanel } from "#src/models/ResolvedPanel";

import { checkIsConditionMet } from "#src/services/checkIsConditionMet";
import { getPanelContentKey } from "#src/services/getPanelContentKey";

// The panels of one region that are present for a context, in the layout's order, each with the content its selection kind shows.
// A panel whose condition fails, or that has no content for the kind, is absent
export const resolvePanels = (panels: Panel[], region: Region, context: Context): ResolvedPanel[] =>
  panels.flatMap((panel) => {
    if (panel.regionId !== region.id || !checkIsConditionMet(panel.condition, context)) return [];
    const contentKey = getPanelContentKey(panel, context.selectionKind);
    return contentKey ? [{ contentKey, id: panel.id }] : [];
  });
