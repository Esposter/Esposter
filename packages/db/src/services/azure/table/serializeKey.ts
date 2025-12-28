import { KeysToCapitalize } from "@/services/azure/table/constants";
import { capitalize } from "@esposter/shared";

export const serializeKey = (key: string): string => (KeysToCapitalize.has(key) ? capitalize(key) : key);
