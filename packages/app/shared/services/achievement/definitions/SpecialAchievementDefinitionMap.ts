import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { AchievementOperator } from "#shared/models/achievement/AchievementOperator";
import { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import { defineAchievementDefinition } from "#shared/services/achievement/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/defineAchievementDefinitionMap";
import { countEmojis } from "#shared/util/text/countEmojis";
import { SpecialAchievementName } from "@esposter/db-schema";

export const SpecialAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Special, {
  [SpecialAchievementName.AllCaps]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operator: AchievementOperator.Matches,
      path: "message",
      type: AchievementConditionType.Property,
      value: /^[A-Z\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?0-9]*$/u,
    },
    description: "Send a message in all uppercase",
    icon: "mdi-format-letter-case-upper",
    points: 15,
    triggerPath: "message.createMessage" as const,
  }),
  [SpecialAchievementName.AllLower]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operator: AchievementOperator.Matches,
      path: "message",
      type: AchievementConditionType.Property,
      value: /^[a-z\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?0-9]*$/u,
    },
    description: "Send a message in all lowercase",
    icon: "mdi-format-letter-case-lower",
    points: 15,
    triggerPath: "message.createMessage" as const,
  }),
  [SpecialAchievementName.EmojiLover]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operation: (value) => (value ? countEmojis(value) >= 10 : false),
      operator: AchievementOperator.Operation,
      path: "message",
      type: AchievementConditionType.Property,
    },
    description: "Send a message with 10+ emojis",
    icon: "mdi-emoticon-excited",
    isHidden: true,
    points: 15,
    triggerPath: "message.createMessage" as const,
  }),
  [SpecialAchievementName.Meta]: defineAchievementDefinition({
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
    condition: {
      operator: AchievementOperator.Matches,
      path: "message",
      type: AchievementConditionType.Property,
      value: /\d{10,}/u,
    },
    description: "Send a message with 10+ numbers",
    icon: "mdi-numeric",
    points: 20,
    triggerPath: "message.createMessage" as const,
  }),
  [SpecialAchievementName.Palindrome]: defineAchievementDefinition({
    amount: 1,
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
});
