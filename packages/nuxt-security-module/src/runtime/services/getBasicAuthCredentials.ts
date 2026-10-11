import { BASIC_AUTHORIZATION_SCHEME } from "#src/runtime/constants";

// Base64 as the Basic scheme carries it, with its padding optional.
// A padded value is whole quanta of four, and an unpadded one never leaves a single character over, which no byte
// Encodes. Either is refused here, since `fromBase64` throws on it and a malformed header would answer 500, not 401
const BASE64_REGEX = /^[\d+/A-Za-z]*={0,2}$/u;
const BASE64_QUANTUM_LENGTH = 4;

const checkIsBase64 = (value: string): boolean =>
  BASE64_REGEX.test(value) &&
  (value.endsWith("=") ? value.length % BASE64_QUANTUM_LENGTH === 0 : value.length % BASE64_QUANTUM_LENGTH !== 1);

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
