// `unicode-emoji-json` points its `types` entry at a file it does not publish. Declaring the shape here also
// Keeps TypeScript from inferring the literal type of a JSON file with a couple of thousand keys on every typecheck.
// Key insertion order is canonical CLDR order, which is the order the picker renders in
declare module "unicode-emoji-json/data-by-emoji.json" {
  // The whole record the dataset ships, not only the four fields the index build reads.
  // `skin_tone_support_unicode_version` is the one optional key: it is present on exactly the records whose
  // `skin_tone_support` is true — a minority of them, with no record disagreeing either way — and absent on the rest.
  // Source: https://github.com/muan/unicode-emoji-json, generated from https://unicode.org/Public/emoji
  interface UnicodeEmojiRecord {
    // The Unicode Emoji release that introduced the character, e.g. "2.0"
    emoji_version: string;
    // One of the nine CLDR groups, matching an `EmojiGroup` value verbatim
    group: string;
    name: string;
    skin_tone_support: boolean;
    skin_tone_support_unicode_version?: string;
    slug: string;
    // The Unicode release that introduced the underlying code point, which can predate `emoji_version`
    unicode_version: string;
  }

  const characterEmojiRecordMap: Record<string, UnicodeEmojiRecord>;
  export default characterEmojiRecordMap;
}
