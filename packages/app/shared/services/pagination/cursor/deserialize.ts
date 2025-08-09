import { jsonDateParse } from "#shared/util/time/jsonDateParse";

export const deserialize = (serializedCursors: string): Record<string, string> =>
  jsonDateParse(Buffer.from(serializedCursors, "base64").toString());
