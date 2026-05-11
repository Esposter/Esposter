import { which } from "node-emoji";

export const unemojify = (emoji: string): string => which(emoji, { markdown: true }) ?? emoji;
