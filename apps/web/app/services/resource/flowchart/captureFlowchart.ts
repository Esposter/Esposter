import type { FlowchartExportFormat } from "@/models/resource/FlowchartExportFormat";

import { FlowchartExportFormat as Format } from "@/models/resource/FlowchartExportFormat";
import { createFlowchartSvg } from "@/services/resource/flowchart/createFlowchartSvg";
import { rasterizeFlowchartSvg } from "@/services/resource/flowchart/rasterizeFlowchartSvg";

export const captureFlowchart = async (element: HTMLElement, format: FlowchartExportFormat) => {
  const { height, width } = element.getBoundingClientRect();
  const svg = await createFlowchartSvg(element);
  return format === Format.Svg ? svg : rasterizeFlowchartSvg(svg, width, height);
};
