import { WORKER_SECRETS_MAX_ENTRIES } from "#src/services/workerSecrets/constants";
import { createRecordSchema, jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";
import { z } from "zod";

const secretsFileSchema = createRecordSchema(z.string(), z.string(), WORKER_SECRETS_MAX_ENTRIES);

// The file the deploy gathered for one Worker: a JSON object of each secret's name to its value, parsed at the edge
export const readWorkerSecrets = (file: string): Record<string, string> =>
  secretsFileSchema.parse(jsonDateParse(readFileSync(file, "utf8")));
