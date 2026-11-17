import type { EditorToolbarItem } from "#src/models/editor/EditorToolbarItem";
import type { GestureTool } from "#src/models/whiteboard/GestureTool";
import type { SetFieldType } from "type-fest";

// A tool the whiteboard's toolbar chooses, held under the tool it chooses. Its shortcut is the key that chooses it
export type WhiteboardToolItem = SetFieldType<EditorToolbarItem, "value", GestureTool>;
