// One keystroke can match most of the dataset, and nothing is virtualised, so results are capped for the DOM
export const MAX_EMOJI_SEARCH_RESULTS = 90;
export const MAX_EMOJI_SUGGESTIONS = 20;
// Discord names a few reactors on hover and counts the rest, which keeps the card one line at any count
export const MAX_REACTION_HOVER_NAMES = 3;
// Two full rows of the picker grid
export const MAX_RECENT_EMOJIS = 18;
// Discord pins its recents category first and calls it this; the clock is the icon it uses for it
export const RECENT_EMOJI_CATEGORY_ICON = "mdi-clock-outline";
export const RECENT_EMOJI_CATEGORY_TITLE = "Frequently Used";
// The room's own uploads, ranked above every unicode category the way Discord ranks a server's set
export const ROOM_EMOJI_CATEGORY_ICON = "mdi-emoticon-plus-outline";
export const ROOM_EMOJI_CATEGORY_TITLE = "Room Emoji";
// What a reaction to a since-deleted room emoji reads as. The reaction still counts, so it needs a label
export const DELETED_EMOJI_DESCRIPTION = "Deleted emoji";
// The swatch the skin-tone menu previews a tone on, chosen because it is a single toneable code point
export const SKIN_TONE_PREVIEW_EMOJI_SLUG = "raised_hand";
// U+FE0F, written escaped because the literal is invisible in source. It qualifies a text-default code point
// As emoji (the difference between the two red hearts), so it is stripped for lookups and dropped by toning
export const VARIATION_SELECTOR = "\uFE0F";
