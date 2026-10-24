import { MERGE_FIELD_COLUMNS_KEY } from "@/services/pageBuilder/mergeFieldColumnsKey";

// The columns the shell provides, or none when it provides none
export const useMergeFieldColumns = () => inject(MERGE_FIELD_COLUMNS_KEY, () => computed<string[]>(() => []), true);
