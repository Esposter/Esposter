export const Compression = { Gzip: "gzip", Zlib: "zlib" } as const;
export type Compression = (typeof Compression)[keyof typeof Compression];
