// Every file of every pack lies once under its hash, whichever accounts keep it, so a file is never stored twice
export const getAccountCharacterPackFileBlobName = (sha256: string): string => `character-packs/files/${sha256}`;
