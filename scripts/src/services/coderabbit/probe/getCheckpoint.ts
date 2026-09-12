import type { GitHubEntry } from "#src/models/coderabbit/GitHubEntry";

// A checkpoint reading is `<id> <updated_at>` for the bot's most recently touched comment, and an empty reading
// Is a failed read rather than a checkpoint (`checkIsCheckpointMoved`).
export const getCheckpoint = (comment: GitHubEntry | undefined): string =>
  comment ? `${comment.id.toString()} ${comment.updated_at}` : "";
