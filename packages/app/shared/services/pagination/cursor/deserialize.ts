import { getIsServer } from "#shared/util/environment/getIsServer";
import { jsonDateParse } from "#shared/util/time/jsonDateParse";

export const deserialize = (serializedCursors: string): Record<string, string> =>
  jsonDateParse(getIsServer() ? Buffer.from(serializedCursors, "base64").toString() : atob(serializedCursors));
