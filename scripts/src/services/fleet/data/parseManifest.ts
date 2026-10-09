import type { Manifest } from "#src/models/fleet/data/Manifest";

import { InvalidOperationError, jsonDateParse, Operation } from "@esposter/shared";

// A manifest a peer printed, checked as a map from directory to digest before any of it is trusted
export const parseManifest = (text: string): Manifest => {
  const value: unknown = jsonDateParse(text);
  if (typeof value !== "object" || value === null || Array.isArray(value))
    throw new InvalidOperationError(Operation.Read, "manifest", "the peer's manifest is not a directory map");
  const manifest: Manifest = {};
  for (const [directory, digest] of Object.entries(value)) {
    if (typeof digest !== "string")
      throw new InvalidOperationError(Operation.Read, "manifest", `the digest of ${directory} is not a string`);
    manifest[directory] = digest;
  }
  return manifest;
};
