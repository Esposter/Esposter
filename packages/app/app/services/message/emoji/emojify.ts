import { get } from "node-emoji";

export const emojify = (emojiTag: string): string => get(emojiTag) ?? emojiTag;
