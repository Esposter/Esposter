import { decodePathSegments } from "#shared/util/text/decodePathSegments";

// A public object's key as its url names it: the router passes the path still percent-encoded, while the bucket holds the decoded key
export const parsePublicKey = (encodedKey: string): string | undefined => decodePathSegments(encodedKey)?.join("/");
