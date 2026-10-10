import type { ResumeItem } from "#src/models/resume/ResumeItem";

import { groupTreePaths } from "#src/services/resume/groupTreePaths";
import { runToolAsync } from "#src/services/resume/runToolAsync";
import { getNonEmptyLines } from "#src/services/shared/getNonEmptyLines";

export const readTreeItems = async (): Promise<ResumeItem[]> =>
  groupTreePaths(getNonEmptyLines(await runToolAsync("git", ["status", "--porcelain"])));
