// The hex SHA-256 the server keys stored bytes by, so a hash computed here compares with one it hands back
export const getSha256Hex = async (bytes: Uint8Array<ArrayBuffer>) =>
  new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)).toHex();
