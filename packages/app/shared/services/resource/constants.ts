import { AzureContainer, DatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Built once and shared between the save procedure and the client save-conflict surface so detection can never drift
export const staleContentVersionErrorMessage = new InvalidOperationError(
  Operation.Update,
  DatabaseEntityType.Resource,
  "cannot save resource content with old content version",
).message;
// The blob-name directory segment for a resource's binary assets. A snapshot channel's segment is its own
// `SnapshotChannel` value rather than a constant restating it
export const FILES_DIRECTORY_SEGMENT = "files";

// Must match the serving route's directory: server/api/resource-assets/[...path].get.ts
export const RESOURCE_ASSETS_URL_PREFIX = `/api/${AzureContainer.ResourceAssets}`;

// Emitted only by `getResourceAssetUrl`, whose per-segment encoding closes the charset by construction —
// The "token we control" case of /docs/architecture/content-token-rewriting: prefix-anchored, positive
// Charset, no opener analysis needed. Global flag — use only via matchAll/replaceAll.
// The lookbehind is what makes the prefix a url rather than a substring of one: authored content can embed a
// Foreign absolute url whose own path carries this prefix (`https://cdn.example.com/api/resource-assets/…`), and
// Matching its tail rewrites the foreign url into a local one on publish and splices a second url into the middle
// Of it on export. A url only starts where no url character precedes it
export const RESOURCE_ASSET_URL_REGEX = new RegExp(
  String.raw`(?<![\w.~%/:-])${RegExp.escape(RESOURCE_ASSETS_URL_PREFIX)}/(?<encodedPath>[\w.~%-]+(?:/[\w.~%-]+)*)`,
  "gu",
);
