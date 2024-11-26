import { jsonDateParse } from "@/shared/util/time/jsonDateParse";

export const parse = (serializedCursors: string): Record<string, string> =>
  jsonDateParse(Buffer.from(serializedCursors, "base64").toString());
