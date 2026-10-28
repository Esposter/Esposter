// One file of an official character pack, read from disk and published under its blob name
export interface CharacterPackFile {
  avatarId: string;
  blobName: string;
  localPath: string;
  size: number;
}
