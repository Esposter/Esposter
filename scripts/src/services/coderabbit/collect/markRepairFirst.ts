import type { RepairFirstInput } from "#src/models/coderabbit/collect/RepairFirstInput";

import { MAIN_BRANCH, REPAIR_FIRST_MARKER, REPAIR_FIRST_SPAN_MS } from "#src/services/coderabbit/collect/constants";
import { getMarkedAtMs } from "#src/services/coderabbit/collect/getMarkedAtMs";
import { getMarker } from "#src/services/coderabbit/collect/getMarker";
import { postCommitComment } from "#src/services/coderabbit/collect/postCommitComment";
import { readNewestCommitComments } from "#src/services/coderabbit/collect/readNewestCommitComments";

// A repair owed once the run's budget can no longer hold its clocks, which under steady merging is most runs: the walk
// Before it spends more than the minutes those clocks leave, so a red asked for last is never started. The head it was
// Owed at is marked, and the run after it starts with the repair (`checkIsRepairFirst`). Once per signature within the
// Span, so a red its repair-first run did not answer leaves the walk first again until the span has passed
export const markRepairFirst = ({ mainSha, signature, viewerLogin }: RepairFirstInput): void => {
  const marker = getMarker(REPAIR_FIRST_MARKER, signature);
  const sinceMs = Date.now() - REPAIR_FIRST_SPAN_MS;
  if (getMarkedAtMs(readNewestCommitComments(), viewerLogin, marker).some((markedAtMs) => markedAtMs > sinceMs)) return;

  const note = `The repair of ${signature.text} is owed at this red ${MAIN_BRANCH} head and the run's budget cannot hold it, so the next run starts with it, ahead of the walk`;
  console.info(note);
  postCommitComment(mainSha, `${marker}\n${note}.`);
};
