import { ASSET_HASH_SOURCE } from "@esposter/shared";

// {resourceId}/files/{hash}: the resource's uuid, then the SHA-256 of the bytes stored under it. Case is matched
// Loosely so an uppercase hash is still recognised as a resource asset and then fails the exact comparison
export const RESOURCE_ASSET_BLOB_NAME_REGEX = new RegExp(
  String.raw`^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}\/files\/(?<hash>${ASSET_HASH_SOURCE})$`,
  "iu",
);
