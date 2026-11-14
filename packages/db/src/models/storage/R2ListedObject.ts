// An object as a listing reports it: its key, and the instant it was last written, which a sweep dates it by
export interface R2ListedObject {
  key: string;
  lastModified: Date;
}
