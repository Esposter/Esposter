// The write grant for one file of a pack about to be kept: the URL it is uploaded to, and the staging id that names
// Its upload, which the keep carries back to name that upload again
export interface CharacterPackUploadGrant {
  sasUrl: string;
  stagingId: string;
}
