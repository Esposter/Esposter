// A reaction stores the emoji itself, and a unicode tag is a sequence of code points that never contains a
// Colon — so this prefix is a namespace the two cannot collide in. Keyed by id rather than by name, so renaming
// An emoji leaves every reaction to it intact. See /docs/esbabbler/emoji
export const CUSTOM_EMOJI_TAG_PREFIX = "custom:";
