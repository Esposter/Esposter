import type { JsonPatchOperation } from "@esposter/shared";

// One edit on a resource's undo history: its operations, the inverses that undo them, and the label the command bar
// Names it by. An interaction id groups the edits of one drag or held key, so they can form one entry
export interface PageBuilderHistoryEntry {
  interactionId?: string;
  inverses: JsonPatchOperation[];
  label: string;
  operations: JsonPatchOperation[];
}
