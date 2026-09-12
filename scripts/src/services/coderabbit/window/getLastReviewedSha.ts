// Every review body states the range it covered. The frontier is the *last* such sha across every body, which
// Is why the bodies arrive here as one array rather than one page at a time: `gh` re-runs a `--jq` filter per
// Page, so a `last` computed there names one page's frontier and the backlog is measured from the wrong commit.
const REVIEWED_RANGE_REGEX = /between [0-9a-f]{40} and (?<sha>[0-9a-f]{40})/gu;

// `undefined`, never a string — no body naming a range is the first-review case, where the merge base is the
// Frontier. A `jq` `last` over an empty array emits the literal `null`, which `git diff` resolves against
// Nothing rather than failing, and the guard that was supposed to catch it never runs.
export const getLastReviewedSha = (bodies: string[]): string | undefined =>
  bodies.flatMap((body) => Array.from(body.matchAll(REVIEWED_RANGE_REGEX), (match) => match.groups?.sha ?? "")).at(-1);
