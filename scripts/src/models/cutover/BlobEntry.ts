// A blob as its container lists it, with the properties a copy carries across. `md5` is the base64 digest Azure stored, or
// `undefined` for a blob Azure never digested, which a copy cannot prove identical and so always rewrites
export interface BlobEntry {
  cacheControl?: string;
  contentDisposition?: string;
  contentType?: string;
  lastModified: Date;
  md5?: string;
  name: string;
  size: number;
}
