import { jsonDateParse } from "@esposter/shared";
import { readFileSync } from "node:fs";

// A wrangler.jsonc read as its parsed object. The file is JSONC: the formatter keeps its trailing commas, which JSON.parse
// Refuses, so they are removed first
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- the caller names the type the file is read as, as jsonDateParse does
export const readWranglerConfiguration = <Configuration>(path: string): Configuration =>
  jsonDateParse<Configuration>(readFileSync(path, "utf8").replaceAll(/,(?<closing>\s*[}\]])/gu, "$<closing>"));
