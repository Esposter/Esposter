import type { DirectoryListing } from "#src/models/fleet/data/DirectoryListing";
import type { FileEntry } from "#src/models/fleet/data/FileEntry";

import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";

const checkIsFileEntry = (value: unknown): value is FileEntry =>
  typeof value === "object" &&
  value !== null &&
  "name" in value &&
  typeof value.name === "string" &&
  "size" in value &&
  typeof value.size === "number" &&
  "mtime" in value &&
  typeof value.mtime === "number";

// One line of a peer's listing, checked before its files are compared with this machine's
export const parseDirectoryListing = (line: string): DirectoryListing => {
  const value: unknown = parseMachineJson(line);
  if (
    typeof value !== "object" ||
    value === null ||
    !("directory" in value) ||
    typeof value.directory !== "string" ||
    !("files" in value) ||
    !Array.isArray(value.files) ||
    !value.files.every(checkIsFileEntry)
  )
    throw new InvalidOperationError(Operation.Read, "listing", "the peer's listing line is malformed");
  return { directory: value.directory, files: value.files };
};
