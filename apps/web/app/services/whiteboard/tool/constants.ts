import type { EditorToolbarItem } from "@/models/editor/EditorToolbarItem";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { GestureTool } from "@/models/whiteboard/GestureTool";
import { WhiteboardShapeItemMap } from "@/services/whiteboard/tool/WhiteboardShapeItemMap";
import { NOTE_IMAGE_MIME_TYPES } from "#shared/services/resource/note/constants";

// The shape tool, one slot in the toolbar whose variants are the shapes it places, so the slot draws the shape last used
export const WHITEBOARD_SHAPE_TOOL_ITEM: EditorToolbarItem = {
  meaning: UiIconMeaning.Block,
  title: "Shape",
  value: GestureTool.Shape,
  variants: Object.values(WhiteboardShapeItemMap),
};
// The image files the picker offers, the same kinds a paste takes
export const WHITEBOARD_IMAGE_ACCEPT = NOTE_IMAGE_MIME_TYPES.join(",");
