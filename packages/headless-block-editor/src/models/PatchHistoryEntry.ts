import type { JsonPatchOperation } from "@esposter/shared";

export interface PatchHistoryEntry {
  inverses: JsonPatchOperation[];
  label: string;
  operations: JsonPatchOperation[];
}
