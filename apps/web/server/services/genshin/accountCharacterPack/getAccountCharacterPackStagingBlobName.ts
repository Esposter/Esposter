// A file is uploaded here before it is kept, and moved under its hash once the server has read and hashed it
export const getAccountCharacterPackStagingBlobName = (userId: string, sha256: string): string =>
  `character-packs/staging/${userId}/${sha256}`;
