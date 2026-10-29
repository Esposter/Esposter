// A file of a published pack the cache lacks: its avatar, its path in the pack, its bytes and the url it is fetched from
// And kept under
export interface CharacterPackDownloadFile {
  avatarId: number;
  bytes: number;
  path: string;
  url: string;
}
