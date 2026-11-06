import type { EditorToolbarItem } from "@/models/editor/EditorToolbarItem";
import type { ShapeKind } from "headless-block-editor";

// A shape the shape tool places, held under the kind it places. A shape with a shortcut is placed by that key with the shape tool
export type WhiteboardShapeItem = Omit<EditorToolbarItem, "value" | "variants"> & { value: ShapeKind };
