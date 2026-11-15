import type { AxisVisualPropsData } from "#src/models/dashboard/AxisVisualPropsData";
import type { VisualPropsData } from "#src/models/dashboard/VisualPropsData";

// A pie, donut or radial bar carries one bare number per slice rather than a named series of values
export const checkIsAxisVisualPropsData = (data: VisualPropsData): data is AxisVisualPropsData =>
  data.series.every((series) => typeof series === "object");
