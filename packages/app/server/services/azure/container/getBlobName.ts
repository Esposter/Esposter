import { extname } from "node:path";

export const getBlobName = (prefix: string, filename: string) => `${prefix}/${extname(filename).toLowerCase()}`;
