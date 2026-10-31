// A reaction stores the emoji itself, and a unicode tag is a sequence of code points that never contains a
// Colon — so this prefix is a namespace the two cannot collide in. Keyed by id rather than by name, so renaming
// An emoji leaves every reaction to it intact. See openspec/specs/esbabbler/emoji/design.md
export const CUSTOM_EMOJI_TAG_PREFIX = "custom:";
// The longest a unicode tag runs, a ZWJ family or a tagged flag being about twenty UTF-16 units. The grapheme count
// Is what bounds a tag to one cluster, so this only keeps the segmenter off a string a cluster could never be
export const UNICODE_EMOJI_TAG_MAX_LENGTH = 32;
