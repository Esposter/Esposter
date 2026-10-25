import { getDecodedUriComponent } from "@esposter/shared";

// The `URL` constructor percent-encodes the pathname while the store is keyed by decoded blob names (real Azure
// decodes the request target the same way), so each path segment is decoded here on its own — every caller looks a
// blob up by the result, and a caller that skipped this would silently miss every blob whose name carries a space or `#`.
//
// A segment that is not valid percent-encoding keeps its raw form rather than throwing. Callers pass urls this
// module did not build, so a name holding a lone `%` (`100%.png` — legal in a blob name) can reach
// `decodeURIComponent` as malformed input: only that segment stays raw while the others still decode, and a throw
// would instead reject a caller's whole batch rather than the one blob it names.
export const decodeSegment = (segment: string): string => getDecodedUriComponent(segment, segment);
