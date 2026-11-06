import type { Finding } from "#src/models/Finding";
import type { Layout } from "#src/models/Layout";

import { getDuplicateIdFindings } from "#src/services/getDuplicateIdFindings";
import { getMissingContentFindings } from "#src/services/getMissingContentFindings";
import { getUnknownRegionFindings } from "#src/services/getUnknownRegionFindings";
import { getUnregisteredContentKeyFindings } from "#src/services/getUnregisteredContentKeyFindings";

// Every gap in a layout for an editor: a selection kind no panel has content for, a content key the editor did not register,
// An id that two regions or two panels share, and a panel in a region the layout lacks. A layout with no gap answers none
export const checkLayout = (layout: Layout, selectionKinds: string[], registeredContentKeys: string[]): Finding[] => {
  const regionIds = layout.regions.map(({ id }) => id);
  const panelIds = layout.panels.map(({ id }) => id);
  return [
    ...getMissingContentFindings(layout, selectionKinds),
    ...getUnregisteredContentKeyFindings(layout, registeredContentKeys),
    ...getDuplicateIdFindings(regionIds),
    ...getDuplicateIdFindings(panelIds),
    ...getUnknownRegionFindings(layout),
  ];
};
