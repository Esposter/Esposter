import { KeysToUncapitalize } from "#src/services/table/constants";
import { uncapitalize } from "@esposter/shared";

export const deserializeKey = (key: string): string => (KeysToUncapitalize.has(key) ? uncapitalize(key) : key);
