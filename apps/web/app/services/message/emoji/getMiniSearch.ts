import type { EmojiDocument } from "@/models/message/emoji/EmojiDocument";
import type MiniSearch from "minisearch";

import { createMiniSearch } from "@/services/message/emoji/createMiniSearch";

let miniSearch: MiniSearch<EmojiDocument> | undefined;
// Separate from `getEmojiIndex` so a surface that only renders a stored reaction never builds a search index
export const getMiniSearch = () => (miniSearch ??= createMiniSearch());
