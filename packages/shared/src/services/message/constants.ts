export const MENTION_ID_ATTRIBUTE = "data-id";
export const MENTION_ITEM_TYPE_ATTRIBUTE = "data-mention-type";
export const MENTION_LABEL_ATTRIBUTE = "data-label";
export const MENTION_TYPE_ATTRIBUTE = "data-type";
export const MENTION_TYPE = "mention";
// The selector every mention rewrite queries with. A caller that rewrites what it finds must parse the message
// Once and query that same tree — mutating elements from a second parse changes nothing the first one
// Serializes — so what is shared here is the selector rather than a helper that returns someone else's nodes
// oxlint-disable-next-line typescript/no-inferrable-types -- the annotation is what --isolatedDeclarations needs
export const MENTION_SELECTOR: string = `span[${MENTION_TYPE_ATTRIBUTE}='${MENTION_TYPE}']`;
export const MENTION_HERE_ID = "@here";
export const MENTION_EVERYONE_ID = "@everyone";
// A custom emoji in message content is a node carrying only what identifies it — the id it resolves by and the
// Name its fallback reads as. The image url is never stored: it is a short-lived read SAS, resolved when the
// Message is rendered. See /docs/esbabbler/emoji
export const CUSTOM_EMOJI_ID_ATTRIBUTE = "data-custom-emoji-id";
export const CUSTOM_EMOJI_NAME_ATTRIBUTE = "data-custom-emoji-name";
export const CUSTOM_EMOJI_TYPE = "customEmoji";
