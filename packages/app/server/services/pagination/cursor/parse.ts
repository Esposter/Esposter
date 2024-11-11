import { jsonDateParse } from "@/shared/utils/time/jsonDateParse";

export const parse = (serializedCursors: string): Record<string, string> =>
  jsonDateParse(Buffer.from(serializedCursors, "base64").toString());
