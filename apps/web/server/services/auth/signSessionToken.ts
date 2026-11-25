import { makeSignature } from "better-auth/crypto";

// The token as better-auth signs a session cookie's value: the token, a dot, then its HMAC-SHA256 under the context's
// Secret. The session reader verifies it with that same secret, so a token signed here is read back as a session
export const signSessionToken = async (token: string, secret: string): Promise<string> =>
  `${token}.${await makeSignature(token, secret)}`;
