import { bookmarksInApp } from "#src/schema/app/bookmarksInApp";
import { bansInMessage } from "#src/schema/message/bansInMessage";
import { roomCategoriesInMessage } from "#src/schema/message/roomCategoriesInMessage";
import { usersToRoomsInMessage } from "#src/schema/message/usersToRoomsInMessage";
import { notificationsInNotification } from "#src/schema/notification/notificationsInNotification";
import { likesInPost } from "#src/schema/post/likesInPost";
import { resourceFavoritesInResource } from "#src/schema/resource/resourceFavoritesInResource";
import { resourcePublicationsInResource } from "#src/schema/resource/resourcePublicationsInResource";
import { blocksInSocial } from "#src/schema/social/blocksInSocial";
import { friendRequestsInSocial } from "#src/schema/social/friendRequestsInSocial";
import { friendsInSocial } from "#src/schema/social/friendsInSocial";

// How long a soft delete's tombstone is kept. The nightly purge removes it past this age, and a client forgets its own copy
// At the same age, so a key the purge removed starts again at version zero on the client too (the overlay design's
// Tombstones decision)
export const TOMBSTONE_RETENTION_MS = Temporal.Duration.from({ days: 7 }).total("milliseconds");

// The tables whose soft deletes the overlay reads back as tombstones, so the purge removes their tombstones. Every D1 table
// Carries a deletedAt column from the metadata, so the column alone cannot tell these apart from the rest. The recycle bin's
// Table is soft-deleted too, but its own purge destroys it on its own retention, so it is not listed here. The registry test
// Fails when a server statement soft-deletes a table this list does not name
export const OVERLAY_TOMBSTONE_TABLES = [
  bansInMessage,
  blocksInSocial,
  bookmarksInApp,
  friendRequestsInSocial,
  friendsInSocial,
  likesInPost,
  notificationsInNotification,
  resourceFavoritesInResource,
  resourcePublicationsInResource,
  roomCategoriesInMessage,
  usersToRoomsInMessage,
] as const;
