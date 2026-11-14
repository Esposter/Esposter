// An object as an R2 bucket lists it. `etag` is the hex MD5 of a single-part upload, the form every copy here writes
export interface R2Object {
  etag: string;
  key: string;
  size: number;
}
