import { KeysToCapitalize } from "@/services/azure/table/constants";
import { capitalize } from "@/util/text/capitalize";

export const serializeKey = (key: string): string => (KeysToCapitalize.has(key) ? capitalize(key) : key);
