import { OPENSPEC_DIRECTORY } from "#src/services/openspec/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

// The text of every spec page of record, read off `openspec/specs`, where a built feature's specification is kept
export const readSpecTexts = (): string[] => {
  const specsDirectory = join(REPOSITORY_ROOT, OPENSPEC_DIRECTORY, "specs");
  return readdirSync(specsDirectory, { encoding: "utf8", recursive: true })
    .filter((file) => file.endsWith(".md"))
    .map((file) => readFileSync(join(specsDirectory, file), "utf8"));
};
