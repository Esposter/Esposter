import type { EditorToolbarItem } from "@/models/editor/EditorToolbarItem";
import type { GestureTool } from "@/models/whiteboard/GestureTool";
import type { Except } from "type-fest";

// A tool the whiteboard's toolbar chooses, held under the tool it chooses. Its shortcut is the key that chooses it
export type WhiteboardToolItem = Except<EditorToolbarItem, "value"> & { value: GestureTool };
