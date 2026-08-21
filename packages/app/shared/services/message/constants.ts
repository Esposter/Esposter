export const MESSAGE_DISPLAY_NAME = "Esbabbler";
export const WEBHOOK_MAX_LENGTH = 1;
// What a room's emoji cost is bounded by. Room emoji are room-owned like attachments, so they sit outside the
// Personal storage quota — a count cap plus the per-file caps the write SAS already signs is the whole
// Accounting story, with nothing to meter. See /docs/esbabbler/emoji
export const MAX_ROOM_EMOJIS = 50;
export const MAX_ROOM_EMOJI_SIZE_BYTES = 256 * 1024;
