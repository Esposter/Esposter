import { runGit } from "#src/services/shared/runGit";
import { getResult } from "@esposter/shared";

// One sequence rather than a pick per commit: a stop is resumed by `--continue`. Whether the sequence ran to its
// End is the answer — a stop leaves it open for the resolver. `-x` names the original in every copy it lands,
// Which is the one record a resolution that drifted the copy's patch id cannot lose (`readCherryShas`), and so
// The one thing `checkIsCarried` can read the replay against. `--empty=keep` lands a commit that empties as it
// Applies as an empty copy for the same reason: the target already holds its change under another patch id,
// `git cherry` still reads the original as owed, and a drop would leave nothing naming it — the exact shape of an
// Abandoned commit. The owed set ignores an empty commit, so the next rewrite sheds the copy rather than replaying
// It; until then `--empty=keep` also rides a copy through, since it implies `--allow-empty`.
export const checkIsPicked = (shas: string[], cwd: string): boolean =>
  shas.length === 0 ||
  getResult(() => runGit(["cherry-pick", "-x", "--empty=keep", ...shas], cwd)).match(
    () => true,
    () => false,
  );
