import { BASIC_AUTHORIZATION_SCHEME } from "#src/runtime/constants";

// Base64 as the Basic scheme carries it, with its padding optional.
// A length of one more than a multiple of four is never valid base64.
// `atob` throws on it, so it is refused here rather than thrown.
const BASE64_REGEX = /^[\d+/A-Za-z]*={0,2}$/u;

// The name and password a `Basic` authorization header carries, `undefined` for any other scheme or a malformed value.
// The password may hold colons, so the name ends at the first one.
// The credentials are UTF-8, as the client encodes them
export const getBasicAuthCredentials = (authorization: null | string): undefined | { name: string; pass: string } => {
  if (!authorization?.startsWith(`${BASIC_AUTHORIZATION_SCHEME} `)) return undefined;

  const encoded = authorization.slice(BASIC_AUTHORIZATION_SCHEME.length + 1).trim();
  if (!BASE64_REGEX.test(encoded) || encoded.length % 4 === 1) return undefined;

  const bytes = Uint8Array.from(atob(encoded), (character) => character.codePointAt(0) ?? 0);
  const decoded = new TextDecoder().decode(bytes);
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return undefined;

  return { name: decoded.slice(0, separatorIndex), pass: decoded.slice(separatorIndex + 1) };
};
