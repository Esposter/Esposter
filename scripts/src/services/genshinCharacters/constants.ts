import type { CharacterPackImageSignature } from "#src/models/genshinCharacters/CharacterPackImageSignature";

import { CharacterPackContentType } from "#src/models/genshinCharacters/CharacterPackContentType";

// What a pack's terms file is found by in its name, the earliest preferred where several match: the Japanese terms, the
// Readme they are often bundled in, the Chinese instructions, terms and rules, and an English name
export const CHARACTER_TERMS_FILE_NAMES: readonly string[] = [
  "利用規約",
  "readme",
  "使用说明",
  "规约",
  "规则",
  "terms",
];
// What a Shift-JIS reading of Chinese text turns up and Japanese terms never hold: the half-width katakana a GBK lead
// Byte reads as, and the private-use letters its highest lead bytes map to
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation
export const CHARACTER_TERMS_NOT_JAPANESE_REGEX: RegExp = /[\uE000-\uF8FF\uFF61-\uFF9F]/u;
// The signature each image a browser decodes starts its bytes with, at its offset, WebP's past its RIFF header
export const CHARACTER_PACK_IMAGE_SIGNATURES: readonly CharacterPackImageSignature[] = [
  { contentType: CharacterPackContentType.Png, offset: 0, signature: [0x89, 0x50, 0x4e, 0x47] },
  { contentType: CharacterPackContentType.Jpeg, offset: 0, signature: [0xff, 0xd8, 0xff] },
  { contentType: CharacterPackContentType.Gif, offset: 0, signature: [0x47, 0x49, 0x46, 0x38] },
  { contentType: CharacterPackContentType.Bmp, offset: 0, signature: [0x42, 0x4d] },
  { contentType: CharacterPackContentType.Webp, offset: 8, signature: [0x57, 0x45, 0x42, 0x50] },
];
