import dataByCharacter from "unicode-emoji-json/data-by-emoji.json";

let unicodeEmojiSlugs: Set<string> | undefined;

// A custom name that shadows a dataset slug is rejected rather than allowed to win: the same `:fire:` would
// Otherwise render differently per room, and a room that later deletes its own entry would silently change every
// Message that used it. Built on first use, because only an upload ever asks
export const checkIsUnicodeEmojiSlug = (name: string) => {
  unicodeEmojiSlugs ??= new Set(Object.values(dataByCharacter).map(({ slug }) => slug));
  return unicodeEmojiSlugs.has(name);
};
