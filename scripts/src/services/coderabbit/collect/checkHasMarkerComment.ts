import type { GitHubEntry } from "#src/models/coderabbit/shared/GitHubEntry";

// A hidden marker in a pull request comment is the collector's memory for a fact no commit can carry — a review
// Whose body-only findings are answered, a drain that failed. An HTML comment renders as nothing.
export const getMarker = (marker: string, reviewId: number): string =>
  `<!-- ${marker} review:${reviewId.toString()} -->`;

export const checkHasMarkerComment = (comments: GitHubEntry[], viewerLogin: string, marker: string): boolean =>
  comments.some(({ body, user }) => user.login === viewerLogin && body.includes(marker));
