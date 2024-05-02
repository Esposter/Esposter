import { jsonDateParse } from "@/util/jsonDateParse";

export const parse = (serializedCursors: string): Record<string, string> =>
  jsonDateParse(Buffer.from(serializedCursors, "base64").toString());
