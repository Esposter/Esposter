import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

// Whether one comment is the pipeline's own record of something: written by the login it must have come from,
// And carrying the text that identifies it. The login half is the point — every text here is public, so a read
// That forgets the author is one a stranger can plant (a forged rate-limit block, a forged reply marker).
export const checkIsMarked = ({ body, user }: GitHubEntry, login: string, text: string): boolean =>
  user.login === login && body.includes(text);
