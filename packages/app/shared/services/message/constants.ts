export const MESSAGE_DISPLAY_NAME = "Esbabbler";
// Crazy big timestamps for calculating reverse-ticked timestamps.
// It also indicates how long before azure table storage
// completely ***ks up trying to insert a negative partition / row key
export const AZURE_SELF_DESTRUCT_TIMER = "9".repeat(30);
export const AZURE_SELF_DESTRUCT_TIMER_SMALL = "9".repeat(15);

export const FILTER_KEY_MAX_LENGTH = 100;
export const MENTION_MAX_LENGTH = 100;
export const MESSAGE_MAX_LENGTH = 10000;
export const ROOM_NAME_MAX_LENGTH = 100;
export const STATUS_MESSAGE_MAX_LENGTH = 1000;

export const MENTION_ID_ATTRIBUTE = "data-id";
export const MENTION_LABEL_ATTRIBUTE = "data-label";
export const MENTION_TYPE_ATTRIBUTE = "data-type";
export const MENTION_TYPE = "mention";
