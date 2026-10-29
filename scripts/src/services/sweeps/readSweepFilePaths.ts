import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";
import { runGit } from "#src/services/shared/runGit";
import { SKILLS_DIRECTORY } from "#src/services/sweeps/constants";
import { readDeletedPaths } from "#src/services/sweeps/readDeletedPaths";
import { readVendoredSkillNames } from "#src/services/sweeps/readVendoredSkillNames";

// `--others` is load-bearing: without it a suite that is written but not yet `git add`ed is out of scope, and the
// Scan reports nothing for it — which reads exactly like a swept tree. `--exclude-standard` keeps ignored output
// (`dist`, `node_modules`) out, so the two flags are a pair rather than a widening.
//
// The cwd is pinned to the repository root rather than inherited, which `runGit` does: `git ls-files` is relative
// To where it runs, so a scan started from a package directory would quietly cover that package alone and report
// A short clean list — the same silent-pass this whole scan exists to avoid, wearing a different hat.
//
// Every pathspec a scan wants goes in one call: git walks its index once for all of them and lists a file matching
// Two only once, where a spawn per pathspec pays the process start each time and hands back the overlap to dedupe.
//
// A tracked file deleted in the working tree is still `--cached`, and a scan that opens it throws — so between an
// `rm` and its commit every scan would be red. The deleted ones are read from the directories the listing names, one
// Listing each, rather than from git's own deleted walk, which stats every tracked file whatever the pathspec.
//
// A vendored skill is tracked so every checkout has it, and it is still a dependency: its prose and its citations are
// Its publisher's, so it is left out here the way `node_modules` is, and no scan reports on it.
export const readSweepFilePaths = (...pathspecs: string[]): string[] => {
  const vendoredSkillDirectories = readVendoredSkillNames().map((name) => `${SKILLS_DIRECTORY}/${name}/`);
  const listedPaths = getNonEmptyLines(
    runGit(["ls-files", "--cached", "--others", "--exclude-standard", ...pathspecs]),
  ).filter(
    (path) =>
      !path.includes("node_modules/") &&
      !path.includes("/.nuxt/") &&
      !vendoredSkillDirectories.some((directory) => path.startsWith(directory)),
  );
  const deletedPaths = readDeletedPaths(listedPaths, REPOSITORY_ROOT);
  return listedPaths.filter((path) => !deletedPaths.has(path));
};
