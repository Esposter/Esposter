import { jsonDateParse } from "#shared/util/time/jsonDateParse";
import { getIsServer } from "@esposter/shared";

export const deserialize = (serializedCursors: string): Record<string, string> =>
  jsonDateParse(getIsServer() ? Buffer.from(serializedCursors, "base64").toString() : atob(serializedCursors));
