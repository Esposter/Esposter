import type { StatedCounts } from "#src/models/coderabbit/shared/StatedCounts";

const ACTIONABLE_REGEX = /Actionable comments posted:\s*(?<count>\d+)/u;
// Every body-only bucket is headed `<Name> comments (N)` — `Nitpick comments (2)`, `Outside diff range comments
// (1)`, `Minor comments (17)` once a long review moves its minor findings out of the inline threads. The walkthrough's
// Counted headings (`Files selected for processing (4)`) never end in `comments`, so they are not buckets.
const BODY_BUCKET_REGEX = /(?<name>[A-Z][A-Za-z ]*?) comments \((?<count>\d+)\)/gu;
// A bucket keeps the first count stated for it: a finding quoting a heading of the same name further down is text
// About a review, not a second bucket.
export const getStatedCounts = (body: string): StatedCounts => {
  const bodyBuckets: Record<string, number> = {};
  for (const { groups } of body.matchAll(BODY_BUCKET_REGEX)) {
    const name = groups?.name?.toLowerCase() ?? "";
    if (!(name in bodyBuckets)) bodyBuckets[name] = Number(groups?.count ?? 0);
  }
  return { actionable: Number(ACTIONABLE_REGEX.exec(body)?.groups?.count ?? 0), bodyBuckets };
};
