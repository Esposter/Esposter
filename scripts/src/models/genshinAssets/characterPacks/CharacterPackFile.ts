// One file of an official character pack, read from disk and published under its blob name. Its path is inside the
// Avatar's folder, with forward slashes, as the pack's manifest lists it
export interface CharacterPackFile {
  avatarId: string;
  blobName: string;
  localPath: string;
  path: string;
  size: number;
}
