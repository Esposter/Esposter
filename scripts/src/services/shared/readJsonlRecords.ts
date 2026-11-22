import type { JsonlRecord } from "#src/models/shared/JsonlRecord";
import type { z } from "zod";

import { compareCodeUnits } from "#src/services/shared/compareCodeUnits";
import { readJsonlRecord } from "#src/services/shared/readJsonlRecord";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Every line of the files in the directory that end in the suffix, each parsed by the schema. The files are read in code
// Unit order, so a rerun reads them in the same order, and a blank line is skipped without losing the count of lines
export const readJsonlRecords = <T>(directory: string, suffix: string, schema: z.ZodType<T>): JsonlRecord<T>[] =>
  readdirSync(directory)
    .filter((name) => name.endsWith(suffix))
    .toSorted(compareCodeUnits)
    .flatMap((name) =>
      readFileSync(join(directory, name), "utf8")
        .split("\n")
        .flatMap((text, index) => {
          if (text.trim() === "") return [];
          const location = `${name}:${index + 1}`;
          return [{ location, record: readJsonlRecord(text, location, schema) }];
        }),
    );
