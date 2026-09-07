import type { CustomEmoji } from "@/models/message/emoji/CustomEmoji";
import type { Emoji } from "@/models/message/emoji/Emoji";

// What a picker, a `:` suggestion list and a category hold: either vocabulary, told apart by `type`
export type PickableEmoji = CustomEmoji | Emoji;
