import type { JSONContent } from "@tiptap/core";

import { AzureContainer, DatabaseEntityType } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Built once and shared between the save procedure and the client save-conflict surface so detection can never drift
export const STALE_CONTENT_VERSION_ERROR_MESSAGE = new InvalidOperationError(
  Operation.Update,
  DatabaseEntityType.Resource,
  "cannot save resource content with old content version",
).message;
// Shared with the client for the same reason: a delta save computed against a baseline the resource no longer
// Holds is retried as a full save inside the same queued call, never shown to the owner
export const CONTENT_BASELINE_MISMATCH_ERROR_MESSAGE = new InvalidOperationError(
  Operation.Update,
  DatabaseEntityType.Resource,
  "cannot apply a content delta to a baseline the resource no longer holds",
).message;
// The largest serialized document a resource may hold, in bytes: Google Sheets' ceiling for a spreadsheet, the
// Reference product for the type that reaches this size (https://support.google.com/drive/answer/37603). A save
// Over the request limit is staged through Blob Storage, and one over this is refused before anything is sent. It is
// Also the ceiling every content schema's free-form strings and lists take, rather than each picking a number a real
// Document might one day cross. No string or list inside a document can outgrow the document holding it
export const MAX_RESOURCE_CONTENT_SIZE = 100_000_000;
// The blob-name directory segment for a resource's binary assets. A snapshot channel's segment is its own
// `SnapshotChannel` value rather than a constant restating it
export const FILES_DIRECTORY_SEGMENT = "files";
// The address of an uploaded file: the lowercase hex SHA-256 of its bytes, the last segment of its blob name
export const ASSET_HASH_REGEX = /^[0-9a-f]{64}$/u;
// How long after the last revision the next save is worth keeping one of. Autosave fires on every coalesced
// Keystroke batch, so without a throttle a working session would take a revision per batch — burning the
// Owner's storage quota while they type and growing a listing nothing bounds. One per interval is the ceiling,
// And against the ring buffer's cap it is also what decides how far back a session can reach
export const SNAPSHOT_INTERVAL_MS = Temporal.Duration.from({ minutes: 15 }).total("milliseconds");
// How long an asset stays after it was last written or re-uploaded before a collection may delete it. An upload that
// Dedupes onto an existing object touches it, and the save naming that object lands a moment later, so a collection
// Running between the two must not take the object from under the save
export const ASSET_GRACE_MS = Temporal.Duration.from({ hours: 1 }).total("milliseconds");
// How far the release moves its decision time back before a replayed deletion is judged against it. The decision is
// stamped by this server and the blob's last-written time by storage, so a skewed clock could otherwise let a re-upload
// that landed just after the decision read as older than it. Moving the stamp back keeps such a blob, and a later release
// collects it once it is unreferenced
export const ASSET_DECISION_CLOCK_MARGIN_MS = Temporal.Duration.from({ minutes: 5 }).total("milliseconds");
// Counting-only: while this is off, release computes the unreferenced assets, logs their count and deletes nothing.
// Read through a function so the rollout flips one return value, and so a suite can hold it either way
export const isAssetCollectionEnabled = (): boolean => false;
// Must match the serving route's directory: server/api/resource-assets/[...path].get.ts
export const RESOURCE_ASSETS_URL_PREFIX = `/api/${AzureContainer.ResourceAssets}`;
// Emitted only by `getResourceAssetUrl`, whose per-segment encoding closes the charset by construction —
// The "token we control" case of openspec/specs/architecture/content-token-rewriting/design.md: prefix-anchored, positive
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
// The most ids one consumer read takes. A query's input rides its URL, and a few hundred ids would pass the server's
// Header limit, so a larger selection is read a chunk at a time
export const READ_RESOURCE_CONSUMERS_IDS_MAX_LENGTH = 100;
// The most characters a webpage's share description takes. It is the meta description a search result shows under
// The title, and the Open Graph description a shared link unfurls with, both of which cut anything longer
export const WEBPAGE_DESCRIPTION_MAX_LENGTH = 160;
