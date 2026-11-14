// A bearer credential is 256 random bits: 32 bytes, written as unpadded base64url, which is 43 characters.
// Its length is what the validator checks, so a credential shorter than this is refused where it arrives
export const SECRET_TOKEN_BYTE_LENGTH = 32;
export const SECRET_TOKEN_LENGTH = 43;
// What a credential is stored as: its SHA-256 digest in lowercase hex, 32 bytes, so 64 characters
export const SECRET_TOKEN_HASH_LENGTH = 64;
