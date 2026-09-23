// The frontier is the last range-naming sha across every body handed in — the review bodies, then the
// Walkthrough's recent-review block — read from one array: `gh` re-runs a `--jq` filter per page, so a `last`
// Computed there names one page's frontier
const REVIEWED_RANGE_REGEX = /between [0-9a-f]{40} and (?<sha>[0-9a-f]{40})/gu;
// `undefined` is the first-review case, where the merge base is the frontier
export const getLastReviewedSha = (bodies: string[]): string | undefined =>
  bodies.flatMap((body) => Array.from(body.matchAll(REVIEWED_RANGE_REGEX), (match) => match.groups?.sha ?? "")).at(-1);
