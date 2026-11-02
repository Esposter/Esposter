import type { History, JsonPatchOperation } from "@esposter/shared";
import type { PositionedDocument } from "headless-block-editor";

// A whiteboard's committed document with its undo history. Each entry is the inverse patch of one edit, so an undo applies the newest
// Entry first, stepping back one edit at a time
export interface WhiteboardEditState {
  document: PositionedDocument;
  history: History<JsonPatchOperation[]>;
}
