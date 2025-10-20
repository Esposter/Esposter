import { KeysToUncapitalize } from "@/services/azure/table/constants";
import { uncapitalize } from "@esposter/shared";

export const deserializeKey = (key: string) => (KeysToUncapitalize.has(key) ? uncapitalize(key) : key);
