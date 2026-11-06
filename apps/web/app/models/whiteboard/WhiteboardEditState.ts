import type { WhiteboardHistoryEntry } from "@/models/whiteboard/WhiteboardHistoryEntry";
import type { History } from "@esposter/shared";
import type { PositionedDocument } from "vue-block-editor-headless";

// A whiteboard's committed document with its undo history. Each entry holds one edit's inverses, which an undo applies newest first,
// stepping back one edit at a time, and its operations, which a redo reapplies to step forward again
export interface WhiteboardEditState {
  document: PositionedDocument;
  history: History<WhiteboardHistoryEntry>;
}
