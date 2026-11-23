import type { JsonPatchOperation } from "@esposter/shared";

// One edit on a whiteboard's undo history: the inverses that undo it, which an undo applies, and the operations that
// Made it, which a redo Reapplies. The two are kept together, so an entry serves both directions as a page's edit entry
// Does
export interface WhiteboardHistoryEntry {
  inverses: JsonPatchOperation[];
  operations: JsonPatchOperation[];
}
