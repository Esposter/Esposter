// A file is uploaded here before it is kept, under the staging id its own grant minted, and moved under its hash once the
// Server has read and hashed it
export const getAccountCharacterPackStagingBlobName = (userId: string, stagingId: string): string =>
  `character-packs/staging/${userId}/${stagingId}`;
