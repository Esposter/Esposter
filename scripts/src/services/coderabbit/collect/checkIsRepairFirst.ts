import {
  REPAIR_FAILED_MARKER,
  REPAIR_FIRST_MARKER,
  REPAIR_FIRST_SPAN_MS,
} from "#src/services/coderabbit/collect/constants";
import { getMarkedAtMs } from "#src/services/coderabbit/collect/getMarkedAtMs";
import { readNewestCommitComments } from "#src/services/coderabbit/collect/readNewestCommitComments";

// Whether this run starts with the repair, ahead of the drain and the walk: the newest repair-first mark
// (`markRepairFirst`) is within its span and no repair attempt has followed it. The run that makes the attempt, pushed
// Or failed, spends the mark, so the walk is held behind a repair for that one run; a run that found the red held, past
// Its repairs or gone makes none, and its repair-first read cost nothing
export const checkIsRepairFirst = (viewerLogin: string): boolean => {
  const comments = readNewestCommitComments();
  const markedAtMs = getMarkedAtMs(comments, viewerLogin, REPAIR_FIRST_MARKER).at(-1);
  return (
    markedAtMs !== undefined &&
    markedAtMs > Date.now() - REPAIR_FIRST_SPAN_MS &&
    getMarkedAtMs(comments, viewerLogin, REPAIR_FAILED_MARKER).every((attemptedAtMs) => attemptedAtMs < markedAtMs)
  );
};
