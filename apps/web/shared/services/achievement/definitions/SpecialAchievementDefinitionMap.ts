// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { zonedCreateMessageInputSchema } from "#shared/models/db/message/ZonedCreateMessageInput";
import { checkIsPalindrome } from "#shared/services/achievement/conditions/checkIsPalindrome";
import { contains } from "#shared/services/achievement/conditions/contains";
import { matches } from "#shared/services/achievement/conditions/matches";
import { property } from "#shared/services/achievement/conditions/property";
import { EMOJI_LOVER_EMOJI_COUNT } from "#shared/services/achievement/constants";
import { defineTriggerAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { countEmojis } from "#shared/util/text/countEmojis";
import { SpecialAchievementName } from "@esposter/db-schema";

// Every special achievement unlocks on a message sent to a room
const defineSpecialAchievementDefinition = defineTriggerAchievementDefinition(
  "message.createMessage",
  zonedCreateMessageInputSchema,
);

export const SpecialAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Special, {
  [SpecialAchievementName.AllCaps]: defineSpecialAchievementDefinition({
    amount: 1,
    condition: property("message", matches(/^[A-Z\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?0-9]*$/u)),
    description: "Send a message in all uppercase",
    icon: "i-mdi:format-letter-case-upper",
    points: 15,
  }),
  [SpecialAchievementName.AllLower]: defineSpecialAchievementDefinition({
    amount: 1,
    condition: property("message", matches(/^[a-z\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?0-9]*$/u)),
    description: "Send a message in all lowercase",
    icon: "i-mdi:format-letter-case-lower",
    points: 15,
  }),
  [SpecialAchievementName.EmojiLover]: defineSpecialAchievementDefinition({
    amount: 1,
    condition: property("message", (value) => (value ? countEmojis(value) >= EMOJI_LOVER_EMOJI_COUNT : false)),
    description: `Send a message with ${EMOJI_LOVER_EMOJI_COUNT}+ emojis`,
    icon: "i-mdi:emoticon-excited",
    isHidden: true,
    points: 15,
  }),
  [SpecialAchievementName.Meta]: defineSpecialAchievementDefinition({
    condition: property("message", contains("achievement unlocked")),
    description: 'Send a message containing "achievement unlocked"',
    icon: "i-mdi:trophy",
    isHidden: true,
    points: 100,
  }),
  [SpecialAchievementName.NumberEnthusiast]: defineSpecialAchievementDefinition({
    amount: 1,
    condition: property("message", matches(/\d{10,}/u)),
    description: "Send a message with 10+ numbers",
    icon: "i-mdi:numeric",
    points: 20,
  }),
  [SpecialAchievementName.Palindrome]: defineSpecialAchievementDefinition({
    amount: 1,
    condition: property("message", checkIsPalindrome),
    description: "Send a palindrome message",
    icon: "i-mdi:mirror",
    isHidden: true,
    points: 50,
  }),
});
