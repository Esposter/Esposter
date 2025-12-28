import { getIsServer, jsonDateParse } from "@esposter/shared";

export const deserialize = (serializedCursors: string): Record<string, string> =>
  jsonDateParse(getIsServer() ? Buffer.from(serializedCursors, "base64").toString() : atob(serializedCursors));
