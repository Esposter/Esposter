import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

import { REPAIR_SIGNATURE_SPAN_MS } from "#src/services/coderabbit/collect/constants";
import { readNewestCommitComments } from "#src/services/coderabbit/collect/readNewestCommitComments";

// The record a red's repair attempts are counted over: each is posted on the head that was red, and a window merged
// Over it makes another head with the same red, so the count reads every commit's newest comments at once
// (`readNewestCommitComments`), kept within the span a signature's attempts are counted over
// (`REPAIR_SIGNATURE_SPAN_MS`)
export const readSignatureAttempts = (): GitHubEntry[] => {
  const sinceMs = Date.now() - REPAIR_SIGNATURE_SPAN_MS;
  return readNewestCommitComments().filter(({ updated_at }) => Date.parse(updated_at) > sinceMs);
};
