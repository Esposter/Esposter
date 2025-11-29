import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { AchievementOperator } from "#shared/models/achievement/AchievementOperator";
import { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { SpecialAchievementName } from "@esposter/db-schema";

export const SpecialAchievementDefinitionMap = {
  [SpecialAchievementName.AllCaps]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Special,
    condition: {
      operator: AchievementOperator.Matches,
      path: "message",
      type: AchievementConditionType.Property,
      value: /^[A-Z\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?0-9]*$/,
    },
    description: "Send a message in all uppercase",
    icon: "mdi-format-letter-case-upper",
    points: 15,
    triggerPath: "message.createMessage" as const,
  }),
  [SpecialAchievementName.AllLower]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Special,
    condition: {
      operator: AchievementOperator.Matches,
      path: "message",
      type: AchievementConditionType.Property,
      value: /^[a-z\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?0-9]*$/,
    },
    description: "Send a message in all lowercase",
    icon: "mdi-format-letter-case-lower",
    points: 15,
    triggerPath: "message.createMessage" as const,
  }),
  [SpecialAchievementName.EmojiLover]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Special,
    condition: {
      operation: (value) => {
        if (!value) return false;
        const segmenter = new Intl.Segmenter("en-US", { granularity: "grapheme" });
        const segments = [...segmenter.segment(value)];
        const emojiCount = segments.filter((segment) =>
          /\p{Emoji_Presentation}|\p{Extended_Pictographic}/u.test(segment.segment),
        ).length;
        return emojiCount >= 10;
      },
      operator: AchievementOperator.Operation,
      path: "message",
      type: AchievementConditionType.Property,
    },
    description: "Send a message with 10+ emojis",
    icon: "mdi-emoticon-excited",
    points: 15,
    triggerPath: "message.createMessage" as const,
  }),
  [SpecialAchievementName.Meta]: defineAchievementDefinition({
    category: AchievementCategory.Special,
    condition: {
      operator: AchievementOperator.Contains,
      path: "message",
      type: AchievementConditionType.Property,
      value: "achievement unlocked",
    },
    description: 'Send a message containing "achievement unlocked"',
    icon: "mdi-trophy",
    isHidden: true,
    points: 100,
    triggerPath: "message.createMessage" as const,
  }),
  [SpecialAchievementName.NumberEnthusiast]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Special,
    condition: {
      operator: AchievementOperator.Matches,
      path: "message",
      type: AchievementConditionType.Property,
      value: /\d{10,}/,
    },
    description: "Send a message with 10+ numbers",
    icon: "mdi-numeric",
    points: 20,
    triggerPath: "message.createMessage" as const,
  }),
  [SpecialAchievementName.Palindrome]: defineAchievementDefinition({
    amount: 1,
    category: AchievementCategory.Special,
    condition: {
      operator: AchievementOperator.IsPalindrome,
      path: "message",
      type: AchievementConditionType.Property,
      value: true,
    },
    description: "Send a palindrome message",
    icon: "mdi-mirror",
    isHidden: true,
    points: 50,
    triggerPath: "message.createMessage" as const,
  }),
};
