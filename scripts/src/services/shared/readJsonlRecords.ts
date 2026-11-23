import type { JsonlRecord } from "#src/models/shared/JsonlRecord";
import type { z } from "zod";

import { listFilesBySuffix } from "#src/services/shared/listFilesBySuffix";
import { readJsonlRecord } from "#src/services/shared/readJsonlRecord";
import { splitNonBlankLines } from "#src/services/shared/splitNonBlankLines";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Every line of the files in the directory that end in the suffix, each parsed by the schema. The files are read in
// Code Unit order, so a rerun reads them in the same order, and a blank line is skipped without losing the count of
// Lines
export const readJsonlRecords = <T>(directory: string, suffix: string, schema: z.ZodType<T>): JsonlRecord<T>[] =>
  listFilesBySuffix(directory, suffix).flatMap((name) =>
    splitNonBlankLines(readFileSync(join(directory, name), "utf8")).map(({ line, lineNumber }) => {
      const location = `${name}:${lineNumber}`;
      return { location, record: readJsonlRecord(line, location, schema) };
    }),
  );
