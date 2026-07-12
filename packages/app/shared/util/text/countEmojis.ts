import { EN_US_GRAPHEME_SEGMENTER } from "#shared/services/intl/constants";

export const countEmojis = (value: string) =>
  [...EN_US_GRAPHEME_SEGMENTER.segment(value)].filter(({ segment }) =>
    /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(segment),
  ).length;
