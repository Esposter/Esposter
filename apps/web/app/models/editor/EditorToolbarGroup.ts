import type { EditorToolbarGroupKind } from "@/models/editor/EditorToolbarGroupKind";
import type { EditorToolbarItem } from "@/models/editor/EditorToolbarItem";

// A run of one kind of item the toolbar draws together: its tools as one tab stop, or its commands as buttons. A tool
// With variants is a group of its own, holding that one tool as its single item
export interface EditorToolbarGroup {
  items: EditorToolbarItem[];
  kind: EditorToolbarGroupKind;
  // The group's accessible name
  label: string;
}
