import { FlowchartExportFormat } from "@/models/resource/FlowchartExportFormat";
import { createFlowchartSvg } from "@/services/capture/createFlowchartSvg";
import { rasterizeFlowchartSvg } from "@/services/capture/rasterizeFlowchartSvg";

export const captureFlowchart = async (element: HTMLElement, format: FlowchartExportFormat) => {
  const { height, width } = element.getBoundingClientRect();
  const svg = await createFlowchartSvg(element);
  return format === FlowchartExportFormat.Svg ? svg : rasterizeFlowchartSvg(svg, width, height);
};
