// A row the server versions. The database raises `version` on every change, and `deletedAt` marks a tombstone
export interface Versioned {
  deletedAt?: Date | null;
  version: number;
}
