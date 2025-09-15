import { KeysToCapitalize } from "#shared/services/azure/table/constants";
import { capitalize } from "@esposter/shared";

export const serializeKey = (key: string) => (KeysToCapitalize.has(key) ? capitalize(key) : key);
