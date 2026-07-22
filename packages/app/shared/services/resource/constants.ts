import { AzureContainer, DatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Built once and shared between the save procedure and the client save-conflict surface so detection can never drift
export const staleContentVersionErrorMessage = new InvalidOperationError(
  Operation.Update,
  DatabaseEntityType.Resource,
  "cannot save resource content with old content version",
).message;

// The blob-name directory segments — the single source for building directory names and validating asset paths
export const FILES_DIRECTORY_SEGMENT = "files";
export const PUBLISHED_DIRECTORY_SEGMENT = "published";

// Must match the serving route's directory: server/api/resource-assets/[...path].get.ts
export const RESOURCE_ASSETS_URL_PREFIX = `/api/${AzureContainer.ResourceAssets}`;

// Emitted only by `getResourceAssetUrl`, whose per-segment encoding closes the charset by construction —
// The "token we control" case of /docs/architecture/content-token-rewriting: prefix-anchored, positive
// Charset, no opener analysis needed. Global flag — use only via matchAll/replaceAll
export const RESOURCE_ASSET_URL_REGEX = new RegExp(
  String.raw`${RegExp.escape(RESOURCE_ASSETS_URL_PREFIX)}/(?<encodedPath>[\w.~%-]+(?:/[\w.~%-]+)*)`,
  "gu",
);
