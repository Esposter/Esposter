import { SECRET_TOKEN_BYTE_LENGTH } from "#src/util/secret/constants";

// The one generator of a bearer credential: a webhook's token, a program participant's token. A credential is never an
// Id, since a v7 carries 74 random bits and its ordering is public, so the bytes come from the platform's CSPRNG alone
export const generateSecretToken = (): string =>
  crypto
    .getRandomValues(new Uint8Array(SECRET_TOKEN_BYTE_LENGTH))
    .toBase64({ alphabet: "base64url", omitPadding: true });
