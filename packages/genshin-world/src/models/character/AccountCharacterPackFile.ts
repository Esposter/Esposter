// A file of a pack the player's account keeps: the path the layout serves it at, and the SHA-256 of its bytes, which the
// Account stores it under and serves it by
export interface AccountCharacterPackFile {
  path: string;
  sha256: string;
}
