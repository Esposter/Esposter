import type { ReleaseVerdictLine } from "#src/models/coderabbit/collect/ReleaseVerdictLine";

import { ReleaseVerdict } from "#src/models/coderabbit/collect/ReleaseVerdict";

const VERDICT_REGEX = /^\s*(?<verdict>merge|hold)\b[\s:—-]*(?<reason>.*)$/imu;
// The verdict line, wherever it sits in the text: the first line of the file the session wrote, or the marker
// Comment's line a later run re-applies. Anything that names neither verb is a hold — a session that wrote
// Nothing, or prose in place of the one word — because a release is never made on a reading nobody reached.
export const getReleaseVerdict = (text: string): ReleaseVerdictLine => {
  const groups = VERDICT_REGEX.exec(text)?.groups;
  if (!groups?.verdict) return { reason: "the session gave no verdict", verdict: ReleaseVerdict.Hold };
  return {
    reason: groups.reason?.trim() || "no reason given",
    verdict: groups.verdict.toLowerCase() === ReleaseVerdict.Merge ? ReleaseVerdict.Merge : ReleaseVerdict.Hold,
  };
};
