// One write target and the size the client declared for it, as handed to reserveStorageBytes.
export interface StorageBlobReservation {
  blobName: string;
  declaredBytes: number;
}
