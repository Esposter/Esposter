import { LINE_NUMBER_PATHSPECS } from "#src/services/citations/constants";
import { getLineNumberCitations } from "#src/services/citations/getLineNumberCitations";
import { readWorkingTreeFiles } from "#src/services/shared/readWorkingTreeFiles";
import { readSweepFilePaths } from "#src/services/sweeps/readSweepFilePaths";

// Every line-number citation in the specs and the skills, one `path:line → text` each. The repository's listing is
// The set a cited file is checked against, so a file the listing lacks is external and is no finding
export const readLineNumberCitationFindings = (): string[] => {
  const repositoryPaths = new Set(readSweepFilePaths());
  return readWorkingTreeFiles(...LINE_NUMBER_PATHSPECS)
    .filter(({ path }) => path.endsWith(".md"))
    .flatMap(({ path, text }) =>
      getLineNumberCitations(path, text, repositoryPaths).map(
        (citation) => `${path}:${citation.line} → ${citation.text}`,
      ),
    );
};
