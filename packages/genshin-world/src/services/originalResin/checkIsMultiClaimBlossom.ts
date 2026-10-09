import { BlossomKind } from "#src/models/originalResin/BlossomKind";

// A ley line's and a domain's claim can be doubled, and paid for its three rewards with a Condensed Resin. A boss's cannot
export const checkIsMultiClaimBlossom = (kind: BlossomKind): boolean =>
  kind === BlossomKind.Domain || kind === BlossomKind.LeyLine;
