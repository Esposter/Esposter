// A file a resource holds, as its listing reads it: the type its upload declared, its size, and the address it is embedded at
export interface ResourceFile {
  mimetype: string;
  size: number;
  url: string;
}
