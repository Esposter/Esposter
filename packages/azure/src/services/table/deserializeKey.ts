import { KEYS_TO_UNCAPITALIZE } from "#src/services/table/constants";
import { uncapitalize } from "@esposter/shared";

export const deserializeKey = (key: string): string => (KEYS_TO_UNCAPITALIZE.has(key) ? uncapitalize(key) : key);
