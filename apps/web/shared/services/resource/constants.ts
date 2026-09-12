import type { JSONContent } from "@tiptap/core";

import { AzureContainer, DatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Built once and shared between the save procedure and the client save-conflict surface so detection can never drift
export const STALE_CONTENT_VERSION_ERROR_MESSAGE = new InvalidOperationError(
  Operation.Update,
  DatabaseEntityType.Resource,
  "cannot save resource content with old content version",
).message;
// The blob-name directory segment for a resource's binary assets. A snapshot channel's segment is its own
// `SnapshotChannel` value rather than a constant restating it
export const FILES_DIRECTORY_SEGMENT = "files";

// How long after the last revision the next save is worth keeping one of. Autosave fires on every coalesced
// Keystroke batch, so without a throttle a working session would take a revision per batch — burning the
// Owner's storage quota while they type and growing a listing nothing bounds. One per interval is the ceiling,
// And against the ring buffer's cap it is also what decides how far back a session can reach
export const SNAPSHOT_INTERVAL_MS = Temporal.Duration.from({ minutes: 15 }).total("milliseconds");

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

// A fresh Note is an empty document with a single paragraph — the shape Tiptap starts an editor with
export const EMPTY_NOTE_DOC: JSONContent = { content: [{ type: "paragraph" }], type: "doc" };
