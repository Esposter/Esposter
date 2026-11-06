import type { PositionedElement } from "headless-block-editor";

import { GestureTool } from "@/models/whiteboard/GestureTool";
import { WhiteboardShapeItemMap } from "@/services/whiteboard/tool/WhiteboardShapeItemMap";
import { WhiteboardToolItemMap } from "@/services/whiteboard/tool/WhiteboardToolItemMap";
import { PositionedElementType } from "headless-block-editor";

// The title a properties panel names one element by: a shape by its kind's name, and every other element by the tool that places it
export const getWhiteboardElementTitle = (element: PositionedElement): string => {
  if (element.type === PositionedElementType.Shape) return WhiteboardShapeItemMap[element.kind].title;
  if (element.type === PositionedElementType.Arrow) return WhiteboardToolItemMap[GestureTool.Arrow].title;
  if (element.type === PositionedElementType.StickyNote) return WhiteboardToolItemMap[GestureTool.StickyNote].title;
  if (element.type === PositionedElementType.Stroke) return WhiteboardToolItemMap[GestureTool.Freehand].title;
  if (element.type === PositionedElementType.Text) return WhiteboardToolItemMap[GestureTool.Text].title;
  return "Image";
};
