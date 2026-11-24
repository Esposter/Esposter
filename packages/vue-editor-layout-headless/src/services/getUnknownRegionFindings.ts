import type { Finding } from "#src/models/Finding";
import type { Layout } from "#src/models/Layout";

import { FindingKind } from "#src/models/FindingKind";

// The finding for each panel whose region the layout does not have.
// It names the panel, since the region it names is the one the layout lacks
export const getUnknownRegionFindings = ({ panels, regions }: Layout): Finding[] => {
  const regionIds = new Set(regions.map(({ id }) => id));
  return panels
    .filter((panel) => !regionIds.has(panel.regionId))
    .map((panel) => ({ kind: FindingKind.UnknownRegion, subject: panel.id }));
};
