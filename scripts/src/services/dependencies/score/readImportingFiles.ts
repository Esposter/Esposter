import { parseImportLines } from "#src/services/dependencies/score/parseImportLines";
import { IMPORT_GREP_PATHSPECS, IMPORT_GREP_PATTERN } from "#src/services/dependencies/score/constants";
import { runGit } from "#src/services/shared/runGit";

// Every package's importing files in one `git grep` over the tracked source, which walks the index once for all of them
export const readImportingFiles = (): Map<string, Set<string>> =>
  parseImportLines(runGit(["grep", "-o", "-n", "-E", IMPORT_GREP_PATTERN, "--", ...IMPORT_GREP_PATHSPECS]));
