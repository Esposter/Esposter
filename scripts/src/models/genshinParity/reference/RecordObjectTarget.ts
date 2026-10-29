// A storage account a stored object is kept in, so an object is only ever uploaded where it is missing. An upload streams
// the file at `localPath`, so a recording is never read whole into memory
export interface RecordObjectTarget {
  exists: (blobName: string) => Promise<boolean>;
  upload: (blobName: string, localPath: string) => Promise<void>;
}
