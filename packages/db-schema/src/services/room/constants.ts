export const NICKNAME_MAX_LENGTH = 32;
export const ROOM_CATEGORY_NAME_MAX_LENGTH = 100;
export const ROOM_EMOJI_NAME_MAX_LENGTH = 32;
// The shortcode charset, which is the unicode dataset's slug charset. `:name:` in the composer resolves against
// One vocabulary, so a custom name is drawn from the same closed set a dataset slug is — anything else and the
// Autocomplete would have to say which kind of token it is completing
export const ROOM_EMOJI_NAME_REGEX = /^[a-z0-9_]+$/u;
export const ROOM_NAME_MAX_LENGTH = 100;
export const ROOM_ROLE_COLOR_MAX_LENGTH = 9;
export const ROOM_ROLE_NAME_MAX_LENGTH = 100;
export const ROOM_TOPIC_MAX_LENGTH = 500;
