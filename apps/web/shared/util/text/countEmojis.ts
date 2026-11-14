import { EN_US_GRAPHEME_SEGMENTER } from "@esposter/shared";

export const countEmojis = (value: string) =>
  [...EN_US_GRAPHEME_SEGMENTER.segment(value)].filter(({ segment }) =>
    /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(segment),
  ).length;
