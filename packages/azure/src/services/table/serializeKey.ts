import { KEYS_TO_CAPITALIZE } from "#src/services/table/constants";
import { capitalize } from "@esposter/shared";

export const serializeKey = (key: string): string => (KEYS_TO_CAPITALIZE.has(key) ? capitalize(key) : key);
