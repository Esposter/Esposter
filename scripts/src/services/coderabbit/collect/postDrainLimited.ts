import { DRAIN_LIMITED_MARKER } from "#src/services/coderabbit/collect/constants";
import { postComment } from "#src/services/coderabbit/collect/postComment";

// Claude Code refused to start because the account is out of session: the instant it lifts goes into a marker
// Every run reads until then (`readDrainLimitResetMs`), and no attempt is counted against whatever the session
// Was for — the outage is not that unit's failure
export const postDrainLimited = (pullRequest: number, limitResetAtMs: number): void => {
  const resetAt = new Date(limitResetAtMs).toISOString();
  postComment(
    pullRequest,
    `<!-- ${DRAIN_LIMITED_MARKER} until ${resetAt} -->\nThe session could not start — the account is out of session until ${resetAt}. No attempt is counted, and the next event after that picks the same work up.`,
  );
  console.info(`the session is limited until ${resetAt} — nothing done, nothing counted`);
};
