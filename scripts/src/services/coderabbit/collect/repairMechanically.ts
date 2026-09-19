import type { MechanicalRepairInput } from "#src/models/coderabbit/collect/MechanicalRepairInput";

import { checkIsGreen } from "#src/services/coderabbit/collect/checkIsGreen";
import { MAIN_BRANCH, REPAIR_REGENERATE_COMMANDS, REPAIRS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { readDirtyPaths } from "#src/services/coderabbit/collect/readDirtyPaths";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { spawnPnpm } from "#src/services/coderabbit/collect/spawnPnpm";
import { runGit } from "#src/services/coderabbit/shared/runGit";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

// The repair a red `main` gets before a session is asked for one. Most of what lands on `main` unread is red for
// A reason with a regenerator — the formatter over a file a fix left unformatted, a lint rule a bump enabled and
// Can fix itself, a ledger whose coverage rows a sweep derives — and for those the session spends a window
// Reading a log to reach the command this runs first. Nothing here classifies the red: the regenerators run, and
// Whether they answered it is the same check suite the cut earns. A red they leave untouched reaches the session
// Having spent nothing; one they move without answering costs the single verify that found that out, and the head
// Is restored so the session starts from the tree it would have found.
//
// Returns the repair's commit, or nothing when the tree did not move or moved without going green.
export const repairMechanically = ({ cwd, mainSha, runUrl }: MechanicalRepairInput): string | undefined => {
  for (const args of REPAIR_REGENERATE_COMMANDS) {
    console.info(`regenerate: pnpm ${args.join(" ")}`);
    spawnPnpm(args, { cwd, stdio: "inherit" });
  }
  if (readDirtyPaths(cwd).length === 0) {
    console.info("no regenerator moved the tree — the red is the session's");
    return undefined;
  } else if (!checkIsGreen(cwd)) {
    console.info("the regenerated tree is still red — restoring it for the session");
    runGit(["reset", "--hard"], cwd);
    runGit(["clean", "--force", "-d"], cwd);
    return undefined;
  }

  runGit(["add", "--all"], cwd);
  const paths = getNonEmptyLines(runGit(["diff", "--cached", "--name-only"], cwd));
  runGit(
    [
      "commit",
      "--message",
      [
        `fix(${MAIN_BRANCH}): regenerate the artifacts a red head left stale`,
        "",
        `\`${MAIN_BRANCH}\` at ${mainSha} was red on ${runUrl}. No session read that red: the collector ran its own regenerators over the head, the artifacts below moved, and the whole check suite passed on the result. Each of them is derived output — the formatter's, a lint rule's own fix, a ledger's coverage rows — so what changed is what the failing check asked for.`,
        "",
        ...paths,
      ].join("\n"),
      "--trailer",
      `${REPAIRS_TRAILER}: ${mainSha}`,
    ],
    cwd,
  );
  return readHeadSha(cwd);
};
