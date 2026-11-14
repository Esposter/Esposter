// The one hash of a bearer credential: what is stored in place of it, and what a presented one is looked up by. A
// Credential is never stored, so a leaked row yields no credential, and no salt is needed since it carries 256 random
// Bits that no table of guesses can cover
export const hashSecretToken = async (token: string): Promise<string> =>
  new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token))).toHex();
