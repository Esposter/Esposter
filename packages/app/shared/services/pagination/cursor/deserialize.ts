import { checkIsServer, jsonDateParse } from "@esposter/shared";

export const deserialize = (serializedCursors: string): Record<string, string> =>
  jsonDateParse(checkIsServer() ? Buffer.from(serializedCursors, "base64").toString() : atob(serializedCursors));
