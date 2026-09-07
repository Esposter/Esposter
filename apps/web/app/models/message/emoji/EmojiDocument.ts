import type { Emoji } from "@/models/message/emoji/Emoji";
import type { PropertyNames } from "@esposter/shared";

import { getPropertyNames } from "@esposter/shared";

// What MiniSearch indexes, and nothing more: the two fields worth matching plus the keywords that exist for
// No other reason. `slug` is the id, so a result maps back to its record through the index's own `slugEmojiMap`
export interface EmojiDocument extends Pick<Emoji, "name" | "slug"> {
  keywords: string;
}

export const EmojiDocumentPropertyNames: PropertyNames<EmojiDocument> = getPropertyNames<EmojiDocument>();
