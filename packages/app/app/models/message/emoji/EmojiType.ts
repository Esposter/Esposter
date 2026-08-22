// Which vocabulary an emoji comes from. A dataset entry renders as its character, a room's upload renders as
// The image it holds, and this discriminant is what lets one glyph component serve both without either
// Surface knowing which kind it was handed
export enum EmojiType {
  Custom = "Custom",
  Unicode = "Unicode",
}
