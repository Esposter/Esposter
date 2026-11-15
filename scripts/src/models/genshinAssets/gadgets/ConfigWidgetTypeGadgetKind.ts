export const ConfigWidgetTypeGadgetKind = {
  ConfigWidgetClientCollector: "ConfigWidgetClientCollector",
  ConfigWidgetClientDetector: "ConfigWidgetClientDetector",
  ConfigWidgetGadgetBuilder: "ConfigWidgetGadgetBuilder",
  ConfigWidgetMiracleRing: "ConfigWidgetMiracleRing",
  ConfigWidgetOneoffGatherPointDetector: "ConfigWidgetOneoffGatherPointDetector",
  ConfigWidgetTreasureMapDetector: "ConfigWidgetTreasureMapDetector",
} as const;
export type ConfigWidgetTypeGadgetKind = (typeof ConfigWidgetTypeGadgetKind)[keyof typeof ConfigWidgetTypeGadgetKind];
