// An object as a flat listing reports it: its key, and when it was last written, which is the one instant R2 keeps
export interface ListedBlobItem {
  name: string;
  uploaded: Date;
}
