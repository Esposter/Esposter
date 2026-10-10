// A blob as a flat listing reports it: its name, and the two instants a sweep dates it by. `createdOn` is optional on
// The listing, so a caller falls back to `lastModified`, which is always present
export interface ListedBlobItem {
  createdOn?: Date;
  lastModified: Date;
  name: string;
}
