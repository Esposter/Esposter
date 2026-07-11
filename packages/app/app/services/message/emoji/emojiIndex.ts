import data from "emoji-mart-vue-fast/data/all.json";
// @ts-expect-error @TODO: https://github.com/serebrov/emoji-mart-vue/issues/121
import { EmojiIndex } from "emoji-mart-vue-fast/src/utils/emoji-data";

// Building the index over the full emoji dataset is expensive, so share one instance across all pickers
export const emojiIndex = new EmojiIndex(data);
