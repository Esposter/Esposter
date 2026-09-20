import { closeSync, openSync, readSync } from "node:fs";

// One span of a file, for the tables and the clips a package holds without reading the gigabytes around them
export const readFileRange = (path: string, offset: number, size: number): Buffer => {
  const descriptor = openSync(path, "r");
  const bytes = Buffer.alloc(size);
  readSync(descriptor, bytes, 0, size, offset);
  closeSync(descriptor);
  return bytes;
};
