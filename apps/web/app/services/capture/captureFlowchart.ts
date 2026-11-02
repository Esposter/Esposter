import { FlowchartExportFormat } from "@/models/resource/FlowchartExportFormat";
import { createFlowchartSvg } from "@/services/capture/createFlowchartSvg";
import { rasterizeSvg } from "@/services/capture/rasterizeSvg";

export const captureFlowchart = async (element: HTMLElement, format: FlowchartExportFormat) => {
  const { height, width } = element.getBoundingClientRect();
  const svg = await createFlowchartSvg(element);
  return format === FlowchartExportFormat.Svg ? svg : rasterizeSvg(svg, width, height);
};
