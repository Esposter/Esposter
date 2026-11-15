export const SpecialAchievementName = {
  AllCaps: "AllCaps",
  AllLower: "AllLower",
  EmojiLover: "EmojiLover",
  Meta: "Meta",
  NumberEnthusiast: "NumberEnthusiast",
  Palindrome: "Palindrome",
} as const;
export type SpecialAchievementName = (typeof SpecialAchievementName)[keyof typeof SpecialAchievementName];
