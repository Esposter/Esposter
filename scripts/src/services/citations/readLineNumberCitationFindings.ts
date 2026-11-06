import { LINE_NUMBER_PATHSPECS } from "#src/services/citations/constants";
import { getLineNumberCitations } from "#src/services/citations/getLineNumberCitations";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Every line-number citation in the specs and the skills, one `path:line → text` each
export const readLineNumberCitationFindings = (): string[] =>
  readSweepFilePaths(...LINE_NUMBER_PATHSPECS)
    .filter((path) => path.endsWith(".md"))
    .flatMap((path) =>
      getLineNumberCitations(readFileSync(resolve(REPOSITORY_ROOT, path), "utf8")).map(
        ({ line, text }) => `${path}:${line} → ${text}`,
      ),
    );
