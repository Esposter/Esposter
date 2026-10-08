import type { GadgetKind } from "genshin-world";

// The gadget kind each widget type of the config is built as, by the enum's value. A type absent from it is one the
// Gadgets do not build yet, so its widgets are left out of the slice
export const ConfigWidgetTypeGadgetKindMap: Readonly<Record<string, `${GadgetKind}`>> = {
  ConfigWidgetClientCollector: "Collector",
  ConfigWidgetClientDetector: "Detector",
  ConfigWidgetGadgetBuilder: "Device",
  ConfigWidgetMiracleRing: "Device",
  ConfigWidgetOneoffGatherPointDetector: "GatherPointFinder",
  ConfigWidgetTreasureMapDetector: "Detector",
};
