import { decodePathSegments } from "#shared/util/text/decodePathSegments";

// A public object's key as its url names it. The router matches the path as it was sent, so each segment reaches the route
// Still percent-encoded, while the bucket holds the decoded name. A segment that decodes to nothing, which a malformed escape
// As in "%E0" does, or to a separator names no key a publisher wrote, so the key is absent rather than a different one
export const parsePublicKey = (encodedKey: string): string | undefined => decodePathSegments(encodedKey)?.join("/");
