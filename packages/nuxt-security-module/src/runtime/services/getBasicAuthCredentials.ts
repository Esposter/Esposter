import { BASIC_AUTHORIZATION_SCHEME } from "#src/runtime/constants";
import { checkIsBase64 } from "#src/runtime/services/checkIsBase64";

// The name and password a `Basic` authorization header carries, `undefined` for any other scheme or a malformed value.
// The password may hold colons, so the name ends at the first one.
// The credentials are UTF-8, as the client encodes them
export const getBasicAuthCredentials = (authorization: null | string): undefined | { name: string; pass: string } => {
  if (!authorization?.startsWith(`${BASIC_AUTHORIZATION_SCHEME} `)) return undefined;

  const encoded = authorization.slice(BASIC_AUTHORIZATION_SCHEME.length + 1).trim();
  if (!checkIsBase64(encoded)) return undefined;

  const decoded = new TextDecoder().decode(Uint8Array.fromBase64(encoded));
  const separatorIndex = decoded.indexOf(":");
  if (separatorIndex === -1) return undefined;

  return { name: decoded.slice(0, separatorIndex), pass: decoded.slice(separatorIndex + 1) };
};
