import { KeysToUncapitalize } from "@/services/azure/table/constants";
import { uncapitalize } from "@/util/text/uncapitalize";

export const deserializeKey = (key: string): string => (KeysToUncapitalize.has(key) ? uncapitalize(key) : key);
