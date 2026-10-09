// The game's tables the Profile tab's stories, voice-overs and namecards are read from, in the dump beside its text maps
export const FETTER_STORY_TABLE_NAME = "FetterStoryExcelConfigData";
export const FETTER_VOICE_TABLE_NAME = "FettersExcelConfigData";
export const AVATAR_TABLE_NAME = "AvatarExcelConfigData";
// The condition kinds a story's open list names: none, which opens it at once, a Friendship Level, which opens it at that level
export const FETTER_NONE_CONDITION_TYPE = "FETTER_COND_NONE";
export const FETTER_LEVEL_CONDITION_TYPE = "FETTER_COND_FETTER_LEVEL";
// The icon names an avatar and its namecard share, the one prefix swapped for the other
export const AVATAR_ICON_PREFIX = "UI_AvatarIcon_";
export const NAMECARD_ICON_PREFIX = "UI_NameCardIcon_";
// The playable characters the game gives no namecard under their avatar icon's name: Xinyan, Yae Miko and Momoka
export const NAMECARDLESS_AVATAR_IDS: readonly number[] = [10_000_044, 10_000_058, 10_000_061];
