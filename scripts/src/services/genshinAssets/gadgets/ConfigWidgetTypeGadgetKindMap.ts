import type { GadgetKind } from "genshin-world";

import { ConfigWidgetTypeGadgetKind } from "#src/models/genshinAssets/gadgets/ConfigWidgetTypeGadgetKind";

// The gadget kind each widget type of the config is built as, by the enum's value. A type absent from it is one the
// Gadgets do not build yet, so its widgets are left out of the slice
export const ConfigWidgetTypeGadgetKindMap: Readonly<Record<string, `${GadgetKind}`>> = {
  [ConfigWidgetTypeGadgetKind.ConfigWidgetClientCollector]: "Collector",
  [ConfigWidgetTypeGadgetKind.ConfigWidgetClientDetector]: "Detector",
  [ConfigWidgetTypeGadgetKind.ConfigWidgetGadgetBuilder]: "Device",
  [ConfigWidgetTypeGadgetKind.ConfigWidgetMiracleRing]: "Device",
  [ConfigWidgetTypeGadgetKind.ConfigWidgetOneoffGatherPointDetector]: "GatherPointFinder",
  [ConfigWidgetTypeGadgetKind.ConfigWidgetTreasureMapDetector]: "Detector",
};
