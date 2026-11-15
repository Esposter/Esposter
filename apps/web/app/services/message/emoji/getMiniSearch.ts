import type { EmojiDocument } from "#src/models/message/emoji/EmojiDocument";
import type MiniSearch from "minisearch";

import { createMiniSearch } from "#src/services/message/emoji/createMiniSearch";

let miniSearch: MiniSearch<EmojiDocument> | undefined;
// Separate from `getEmojiIndex` so a surface that only renders a stored reaction never builds a search index
export const getMiniSearch = () => (miniSearch ??= createMiniSearch());
