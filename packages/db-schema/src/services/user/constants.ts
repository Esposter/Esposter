// Auth ids are minted by the auth library: better-auth's own are 32 characters and the adapter before it used a
// UUID, so a UUID's length is the longest id any account or session here carries
export const SESSION_ID_MAX_LENGTH = 36;
export const STATUS_MESSAGE_MAX_LENGTH = 64;
export const USER_BIOGRAPHY_MAX_LENGTH = 160;
export const USER_ID_MAX_LENGTH = SESSION_ID_MAX_LENGTH;
export const USER_NAME_MAX_LENGTH = 100;
