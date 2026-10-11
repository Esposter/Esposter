import type { PortInput } from "#src/models/coderabbit/collect/PortInput";
import type { PortResult } from "#src/models/coderabbit/collect/PortResult";

import { PickOutcome } from "#src/models/coderabbit/collect/PickOutcome";
import { EXPRESS_TRAILER } from "#src/services/coderabbit/collect/constants";
import { pickCommit } from "#src/services/coderabbit/collect/pickCommit";
import { readCherryShas } from "#src/services/coderabbit/collect/readCherryShas";
import { readHeadSha } from "#src/services/coderabbit/collect/readHeadSha";
import { readTrailedShas } from "#src/services/coderabbit/collect/readTrailedShas";
import { readWindowFileCount } from "#src/services/coderabbit/collect/readWindowFileCount";
import { REVIEW_FILE_CAP } from "#src/services/coderabbit/shared/constants";
import { runGit } from "#src/services/shared/runGit";

// Build the window as a branch, one cherry-pick at a time, and measure after each from the tree that will be pushed.
// Every count is the bot's own: the diff against the window's base (`main`, or the window below), since its one review
// Reads everything above that base — a window `develop` already carries unopened included. A commit alone over the
// Room never reaches here unheld — the sync reshapes it first, or parks it past the reshaper's cap — so a hold is the
// Residual case the opener parks. Fixes and queue alike are cut to `fileCap`, which a re-cut halves — all but the first
// Fix, which only the bot's own cap holds back — and the cap the window was cut under is returned for the opener to
// Measure its fold against.
export const portWindow = ({ baseSha, cwd, developSha, fileCap, fixShas, queueSha }: PortInput): PortResult => {
  runGit(["switch", "--detach", developSha], cwd);

  // The fixes lead, cut at a commit boundary by the same count as the queue: fixes that alone pass the cap go out over
  // As many windows as it takes, each the fixes alone, and the queue waits behind the last of them. The first fix the
  // Window cannot take is held as a queue commit is, the window being the fixes before it, so a fix no window can take
  // — alone over the bot's cap, or conflicting once a fix before it was parked — is parked by the opener rather than
  // Failing every run while nothing shrinks the fixes. A re-cut's smaller cap cuts them too, but never the first: one
  // The bot's own cap holds goes out alone rather than parked, so only a fix no review could read is ever parked
  let fixCount = fixShas.length;
  let heldSha: string | undefined;
  for (const [index, sha] of fixShas.entries()) {
    const beforeSha = readHeadSha(cwd);
    const outcome = pickCommit(sha, cwd);
    const capFileCount = index === 0 ? REVIEW_FILE_CAP : fileCap;
    if (outcome === PickOutcome.Conflict || readWindowFileCount(baseSha, cwd) > capFileCount) {
      runGit(["reset", "--hard", beforeSha], cwd);
      fixCount = index;
      heldSha = sha;
      break;
    }
  }
  // Owed against the tree the fixes built, not develop: a queue rebased onto `ai/review-fixes` carries the fix
  // Commits as ancestors, and against develop they would be re-picked onto a tree that already holds them. A held fix
  // Leaves the window the fixes before it, with no queue commit behind them
  const owedShas = heldSha === undefined ? readCherryShas(readHeadSha(cwd), queueSha, cwd) : [];
  const claimedShas = readTrailedShas(owedShas, EXPRESS_TRAILER, cwd);
  const queueShas: string[] = [];
  // The claimed commits passed over since the last carry, in queue order
  let skippedShas: string[] = [];
  for (const sha of owedShas) {
    // A commit claiming no review is the express lane's, not a window's: the lane cuts it onto `main` when it
    // Applies, so nothing behind it waits on a review it does not need
    if (claimedShas.has(sha)) {
      skippedShas.push(sha);
      continue;
    }
    const beforeSha = readHeadSha(cwd);
    let carriedShas: string[] = [];
    let outcome = pickCommit(sha, cwd);
    // Unless what follows builds on it — its own fix, most often — which the lane cannot apply either while the
    // Claimed commit is still owed: the window carries the claims passed over, then the commit, so neither lane
    // Waits on the other
    if (outcome === PickOutcome.Conflict && skippedShas.length > 0) {
      carriedShas = skippedShas.filter((skippedSha) => pickCommit(skippedSha, cwd) === PickOutcome.Applied);
      outcome = pickCommit(sha, cwd);
    }
    if (outcome === PickOutcome.Empty) {
      runGit(["reset", "--hard", beforeSha], cwd);
      continue;
    } else if (outcome === PickOutcome.Conflict || readWindowFileCount(baseSha, cwd) > fileCap) {
      runGit(["reset", "--hard", beforeSha], cwd);
      heldSha = sha;
      break;
    }
    queueShas.push(...carriedShas, sha);
    skippedShas = skippedShas.filter((skippedSha) => !carriedShas.includes(skippedSha));
  }

  const fileCount = readWindowFileCount(baseSha, cwd);
  // Nothing passes the cap the window is given but a first fix alone, so a window past it was cut under the bot's own
  return { fileCap: fileCount > fileCap ? REVIEW_FILE_CAP : fileCap, fileCount, fixCount, heldSha, queueShas };
};
