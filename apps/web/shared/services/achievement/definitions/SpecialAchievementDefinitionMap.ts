// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { EMOJI_LOVER_EMOJI_COUNT } from "#shared/services/achievement/constants";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { countEmojis } from "#shared/util/text/countEmojis";
import { SpecialAchievementName, standardCreateMessageInputSchema } from "@esposter/db-schema";
import { contains } from "#shared/services/achievement/conditions/contains";
import { isPalindrome } from "#shared/services/achievement/conditions/isPalindrome";
import { matches } from "#shared/services/achievement/conditions/matches";
import { property } from "#shared/services/achievement/conditions/property";

export const SpecialAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Special, {
  [SpecialAchievementName.AllCaps]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", matches(/^[A-Z\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?0-9]*$/u)),
    description: "Send a message in all uppercase",
    icon: "i-mdi:format-letter-case-upper",
    points: 15,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [SpecialAchievementName.AllLower]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", matches(/^[a-z\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?0-9]*$/u)),
    description: "Send a message in all lowercase",
    icon: "i-mdi:format-letter-case-lower",
    points: 15,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [SpecialAchievementName.EmojiLover]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", (value) => (value ? countEmojis(value) >= EMOJI_LOVER_EMOJI_COUNT : false)),
    description: `Send a message with ${EMOJI_LOVER_EMOJI_COUNT}+ emojis`,
    icon: "i-mdi:emoticon-excited",
    isHidden: true,
    points: 15,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [SpecialAchievementName.Meta]: defineAchievementDefinition({
    condition: property("message", contains("achievement unlocked")),
    description: 'Send a message containing "achievement unlocked"',
    icon: "i-mdi:trophy",
    isHidden: true,
    points: 100,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [SpecialAchievementName.NumberEnthusiast]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", matches(/\d{10,}/u)),
    description: "Send a message with 10+ numbers",
    icon: "i-mdi:numeric",
    points: 20,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [SpecialAchievementName.Palindrome]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", isPalindrome),
    description: "Send a palindrome message",
    icon: "i-mdi:mirror",
    isHidden: true,
    points: 50,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
});
