import { jsonDateParse } from "@/util/jsonDateParse";

export const parse = (serializedCursors: string): Record<string, unknown> =>
  jsonDateParse(Buffer.from(serializedCursors, "base64").toString()) as Record<string, unknown>;
