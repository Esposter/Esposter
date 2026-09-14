import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

// Whether one comment is the pipeline's own record of something: written by the login it must have come from, and
// Carrying the text that identifies it — a marker (`getMarker`), the retrigger's body, a sha a reply cites.
//
// The login half is the whole point of the rule and the reason this is a named predicate rather than a condition
// Each site spells. Every text here is public — a marker is quoted in the file that reads it — so anyone who can
// Comment on the pull request can post one, and a read that forgets the author is one a stranger can plant: a
// Forged rate-limit block parks the collector behind whatever deadline its author chose, a forged reply marker
// Makes it skip a reply it owes. Each caller still spells its own terminator, because whether it wants the newest
// One, any one, or a count of them is the question it came to ask.
export const checkIsMarked = ({ body, user }: GitHubEntry, login: string, text: string): boolean =>
  user.login === login && body.includes(text);
