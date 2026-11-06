import type { EditorToolbarItem } from "@/models/editor/EditorToolbarItem";
import type { Except } from "type-fest";
import type { ShapeKind } from "vue-block-editor-headless";

// A shape the shape tool places, held under the kind it places. A shape with a shortcut is placed by that key with the shape tool
export type WhiteboardShapeItem = Except<EditorToolbarItem, "value" | "variants"> & { value: ShapeKind };
