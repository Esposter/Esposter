// One file of an official character pack, read from disk and published under its key. Its path is inside the
// Avatar's folder, with forward slashes, as the pack's manifest lists it
export interface CharacterPackFile {
  avatarId: string;
  key: string;
  localPath: string;
  path: string;
  size: number;
}
