import type { StatedCounts } from "#src/coderabbit/models/StatedCounts";

const ACTIONABLE_REGEX = /Actionable comments posted:\s*(?<count>\d+)/u;
const NITPICK_REGEX = /Nitpick comments \((?<count>\d+)\)/u;
const OUTSIDE_DIFF_REGEX = /Outside diff range comments \((?<count>\d+)\)/u;

const getCount = (body: string, regex: RegExp): number => Number(regex.exec(body)?.groups?.count ?? 0);

// A review states its own three counts, and they are what a fetch reconciles against: fewer findings in hand
// Than these means some were missed. An absent bucket is zero rather than undefined — the review carried none.
export const getStatedCounts = (body: string): StatedCounts => ({
  actionable: getCount(body, ACTIONABLE_REGEX),
  nitpick: getCount(body, NITPICK_REGEX),
  outsideDiff: getCount(body, OUTSIDE_DIFF_REGEX),
});
