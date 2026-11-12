import { ID_SEPARATOR } from "@esposter/shared";

// The ids a `getIdsKey` joined, so the two are the one place that knows the separator
export const getIdsFromKey = (idsKey: string) => (idsKey ? idsKey.split(ID_SEPARATOR) : []);
