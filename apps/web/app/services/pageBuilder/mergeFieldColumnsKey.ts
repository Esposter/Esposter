import type { ComputedRef, InjectionKey } from "vue";

// The column names of the dataset an email is bound to, which its merge fields are offered from. A shell that binds no
// Dataset provides none, so the page builder offers no merge field
export const MERGE_FIELD_COLUMNS_KEY: InjectionKey<ComputedRef<string[]>> = Symbol("mergeFieldColumns");
