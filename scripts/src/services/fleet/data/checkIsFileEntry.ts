import type { FileEntry } from "#src/models/fleet/data/FileEntry";

export const checkIsFileEntry = (value: unknown): value is FileEntry =>
  typeof value === "object" &&
  value !== null &&
  "name" in value &&
  typeof value.name === "string" &&
  "size" in value &&
  typeof value.size === "number" &&
  "mtime" in value &&
  typeof value.mtime === "number";
