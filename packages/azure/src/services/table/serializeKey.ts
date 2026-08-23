import { KeysToCapitalize } from "#src/services/table/constants";
import { capitalize } from "@esposter/shared";

export const serializeKey = (key: string): string => (KeysToCapitalize.has(key) ? capitalize(key) : key);
