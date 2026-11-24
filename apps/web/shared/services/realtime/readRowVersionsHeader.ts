import type { RowVersion } from "@esposter/db-schema";

import { ROW_VERSIONS_HEADER, TOPICS_HEADER_SEPARATOR } from "#shared/services/realtime/constants";
import { getDecodedUriComponent } from "#shared/util/text/getDecodedUriComponent";
import { createRecordSchema, getResult } from "@esposter/shared";
import { z } from "zod";

// The most scope columns any table declares, which bounds the entries a row's key can hold
const MAX_ROW_KEY_ENTRIES = 4;

// A row as the header carries it: its key's values, its table and the version its write left it at. A key value is the
// Row's own, a string or a number as its column holds it, and a string can be any text, a file's path a person chose
// Among them
const rowVersionSchema = z.object({
  key: createRecordSchema(z.string().min(1), z.union([z.string(), z.number()]), MAX_ROW_KEY_ENTRIES),
  table: z.string().min(1),
  version: z.int().nonnegative(),
}) satisfies z.ZodType<RowVersion>;

// Reads one entry back: its row, decoded from the header's encoding and parsed as JSON. A text that does not decode or
// Parse, or that parses to no row version, is no row version
const readRowVersion = (text: string): RowVersion | undefined => {
  const json = getDecodedUriComponent(text, undefined);
  if (json === undefined) return undefined;

  /* oxlint-disable-next-line no-restricted-properties -- a scope value can be a path a person named, and a date reviver
     would turn an ISO-shaped one into a Date the string schema refuses */
  const parsedJson = getResult<unknown>(() => JSON.parse(json)).unwrapOr(undefined);
  const parsedRowVersion = rowVersionSchema.safeParse(parsedJson);
  return parsedRowVersion.success ? parsedRowVersion.data : undefined;
};

// The row versions one procedure path's mutation changed, out of a batch's header: each row reads back whole
// An entry for another path, or one that does not read back, is left out
export const readRowVersionsHeader = (headers: Headers, path: string): RowVersion[] =>
  (headers.get(ROW_VERSIONS_HEADER) ?? "")
    .split(",")
    .map((value) => value.trim().split(TOPICS_HEADER_SEPARATOR))
    .filter(([valuePath]) => valuePath === path)
    .flatMap(([, rowVersionText = ""]) => {
      const rowVersion = readRowVersion(rowVersionText);
      return rowVersion === undefined ? [] : [rowVersion];
    });
