// `unicode-emoji-json` points its `types` entry at a file it does not publish. Declaring the shape here also
// Keeps TypeScript from inferring the literal type of a 1914-key JSON file on every typecheck.
// Key insertion order is canonical CLDR order, which is the order the picker renders in
declare module "unicode-emoji-json/data-by-emoji.json" {
  const characterEmojiRecordMap: Record<string, import("@/models/message/emoji/UnicodeEmojiRecord").UnicodeEmojiRecord>;
  export default characterEmojiRecordMap;
}
