import { MERGE_FIELD_KIND_PREFIX } from "@/services/pageBuilder/constants";

// The column a palette item's kind names when it is a merge field's, or undefined when it names a block type
export const getMergeFieldColumnName = (itemKind: string): string | undefined =>
  itemKind.startsWith(MERGE_FIELD_KIND_PREFIX) ? itemKind.slice(MERGE_FIELD_KIND_PREFIX.length) : undefined;
