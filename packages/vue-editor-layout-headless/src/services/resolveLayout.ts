import type { Context } from "#src/models/Context";
import type { Layout } from "#src/models/Layout";
import type { ReaderState } from "#src/models/ReaderState";
import type { ResolvedLayout } from "#src/models/ResolvedLayout";
import type { ResolvedRegion } from "#src/models/ResolvedRegion";
import type { SizeClass } from "#src/models/SizeClass";

import { resolvePanels } from "#src/services/resolvePanels";
import { resolveRegion } from "#src/services/resolveRegion";

// A layout as a reader sees it for a context, a size class and the reader's state. It answers the regions that hold a present panel,
// In the layout's order, and always the canvas
export const resolveLayout = (
  layout: Layout,
  context: Context,
  sizeClass: SizeClass,
  readerState: ReaderState,
): ResolvedLayout => {
  const regions: ResolvedRegion[] = [];
  for (const region of layout.regions) {
    const panels = resolvePanels(layout.panels, region, context);
    if (panels.length > 0) regions.push(resolveRegion(region, panels, sizeClass, readerState));
  }
  return { canvasId: layout.canvasId, regions };
};
