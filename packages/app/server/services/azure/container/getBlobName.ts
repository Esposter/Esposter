import { extname } from "node:path";

export const getBlobName = (filepath: string, filename: string) => `${filepath}${extname(filename).toLowerCase()}`;
