import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

// Whether a marker (`getMarker`) is already on the pull request. Scoped to the login the caller names, as every
// Marker read here is: the characters are public, so an unscoped read is one anyone who can comment can plant.
export const checkHasMarkerComment = (comments: GitHubEntry[], viewerLogin: string, marker: string): boolean =>
  comments.some(({ body, user }) => user.login === viewerLogin && body.includes(marker));
