// A file is uploaded here before its keep, under the keep's own id, so two keeps that carry the same hash never share a
// Staged blob. It is moved under its hash once the server has read and hashed it
export const getAccountCharacterPackStagingBlobName = (userId: string, keepId: string, sha256: string): string =>
  `character-packs/staging/${userId}/${keepId}/${sha256}`;
