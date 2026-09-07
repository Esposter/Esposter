import { KIBIBYTE, MEGABYTE } from "#shared/services/app/constants";

export const MESSAGE_DISPLAY_NAME = "Esbabbler";
export const WEBHOOK_MAX_LENGTH = 1;
// Creating a webhook takes no decisions, so the row arrives named and is renamed in place — the name only ever
// Labels the poster, and asking for it first is a form in front of a one-click action
export const DEFAULT_WEBHOOK_NAME = "Webhook";
// What a room's emoji cost is bounded by. Room emoji are room-owned like attachments, so they sit outside the
// Personal storage quota — a count cap plus the per-file caps the write SAS already signs is the whole
// Accounting story, with nothing to meter. See /docs/esbabbler/emoji
export const MAX_ROOM_EMOJIS = 50;
export const MAX_ROOM_EMOJI_SIZE_BYTES = 256 * KIBIBYTE;
// What a user's call backgrounds cost is bounded by. A slot's blob name is derived from its index rather than
// Allocated, so the count is a property of the naming instead of something to enforce — and the size is read
// Back off the listing, because a write SAS cannot bound what is PUT through it.
// See /docs/esbabbler/calls/virtual-backgrounds
export const MAX_CALL_BACKGROUNDS = 5;
export const MAX_CALL_BACKGROUND_SIZE_BYTES = 2 * MEGABYTE;
