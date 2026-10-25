import type { DirectoryListing } from "#src/models/fleet/data/DirectoryListing";

import { checkIsFileEntry } from "#src/services/fleet/data/checkIsFileEntry";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";

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
    !value.files.every((file) => checkIsFileEntry(file))
  )
    throw new InvalidOperationError(Operation.Read, "listing", "the peer's listing line is malformed");
  return { directory: value.directory, files: value.files };
};
