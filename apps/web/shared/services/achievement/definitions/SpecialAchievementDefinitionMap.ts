// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { zonedCreateMessageInputSchema } from "#shared/models/db/message/ZonedCreateMessageInput";
import { checkIsPalindrome } from "#shared/services/achievement/conditions/checkIsPalindrome";
import { contains } from "#shared/services/achievement/conditions/contains";
import { matches } from "#shared/services/achievement/conditions/matches";
import { property } from "#shared/services/achievement/conditions/property";
import { EMOJI_LOVER_EMOJI_COUNT } from "#shared/services/achievement/constants";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { countEmojis } from "#shared/util/text/countEmojis";
import { SpecialAchievementName } from "@esposter/db-schema";

export const SpecialAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Special, {
  [SpecialAchievementName.AllCaps]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", matches(/^[A-Z\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?0-9]*$/u)),
    description: "Send a message in all uppercase",
    icon: "i-mdi:format-letter-case-upper",
    inputSchema: zonedCreateMessageInputSchema,
    points: 15,
    triggerPath: "message.createMessage",
  }),
  [SpecialAchievementName.AllLower]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", matches(/^[a-z\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?0-9]*$/u)),
    description: "Send a message in all lowercase",
    icon: "i-mdi:format-letter-case-lower",
    inputSchema: zonedCreateMessageInputSchema,
    points: 15,
    triggerPath: "message.createMessage",
  }),
  [SpecialAchievementName.EmojiLover]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", (value) => (value ? countEmojis(value) >= EMOJI_LOVER_EMOJI_COUNT : false)),
    description: `Send a message with ${EMOJI_LOVER_EMOJI_COUNT}+ emojis`,
    icon: "i-mdi:emoticon-excited",
    inputSchema: zonedCreateMessageInputSchema,
    isHidden: true,
    points: 15,
    triggerPath: "message.createMessage",
  }),
  [SpecialAchievementName.Meta]: defineAchievementDefinition({
    condition: property("message", contains("achievement unlocked")),
    description: 'Send a message containing "achievement unlocked"',
    icon: "i-mdi:trophy",
    inputSchema: zonedCreateMessageInputSchema,
    isHidden: true,
    points: 100,
    triggerPath: "message.createMessage",
  }),
  [SpecialAchievementName.NumberEnthusiast]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", matches(/\d{10,}/u)),
    description: "Send a message with 10+ numbers",
    icon: "i-mdi:numeric",
    inputSchema: zonedCreateMessageInputSchema,
    points: 20,
    triggerPath: "message.createMessage",
  }),
  [SpecialAchievementName.Palindrome]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", checkIsPalindrome),
    description: "Send a palindrome message",
    icon: "i-mdi:mirror",
    inputSchema: zonedCreateMessageInputSchema,
    isHidden: true,
    points: 50,
    triggerPath: "message.createMessage",
  }),
});
