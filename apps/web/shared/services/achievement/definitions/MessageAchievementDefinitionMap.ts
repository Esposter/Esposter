// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { AchievementOperator } from "#shared/models/achievement/AchievementOperator";
import { AchievementConditionType } from "#shared/models/achievement/type/AchievementConditionType";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { countEmojis } from "#shared/util/text/countEmojis";
import { BinaryOperator } from "@esposter/azure";
import { MessageAchievementName } from "@esposter/db-schema";

export const MessageAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Message, {
  [MessageAchievementName.CenturyClub]: defineAchievementDefinition({
    amount: 100,
    description: "Send 100 messages",
    icon: "i-mdi:message",
    points: 100,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.Chatterbox]: defineAchievementDefinition({
    amount: 500,
    description: "Send 500 messages",
    icon: "i-mdi:message-processing",
    points: 250,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.ConversationKeeper]: defineAchievementDefinition({
    amount: 50,
    condition: {
      operator: BinaryOperator.Ne,
      path: "replyRowKey",
      type: AchievementConditionType.Property,
      value: undefined,
    },
    description: "Reply to 50 messages",
    icon: "i-mdi:reply",
    points: 75,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.EarlyBird]: defineAchievementDefinition({
    condition: { maximum: 7, minimum: 5, referenceUnit: "day", type: AchievementConditionType.Time, unit: "hour" },
    description: "Send a message between 5-7 AM",
    icon: "i-mdi:weather-sunset-up",
    points: 25,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.EmojiMaster]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operation: (value) => (value ? countEmojis(value) >= 1 : false),
      operator: AchievementOperator.Operation,
      path: "message",
      type: AchievementConditionType.Property,
    },
    description: "Send a message with an emoji",
    icon: "i-mdi:emoticon-cool",
    points: 15,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.EssayWriter]: defineAchievementDefinition({
    condition: {
      operator: BinaryOperator.Ge,
      path: "message.length",
      type: AchievementConditionType.Property,
      value: 1000,
    },
    description: "Send a message with over 1,000 characters",
    icon: "i-mdi:text-long",
    points: 40,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.FileSharer]: defineAchievementDefinition({
    amount: 1,
    condition: { operator: BinaryOperator.Gt, path: "files.length", type: AchievementConditionType.Property, value: 0 },
    description: "Share your first file",
    icon: "i-mdi:file-upload",
    points: 20,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.FirstMessage]: defineAchievementDefinition({
    amount: 1,
    description: "Send your first message",
    icon: "i-mdi:message-text",
    points: 10,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.Gossip]: defineAchievementDefinition({
    amount: 50,
    description: "Forward 50 messages",
    icon: "i-mdi:share-variant",
    points: 100,
    triggerPath: "message.forwardMessage",
  }),
  [MessageAchievementName.LinkSharer]: defineAchievementDefinition({
    amount: 1,
    condition: {
      operator: AchievementOperator.Contains,
      path: "message",
      type: AchievementConditionType.Property,
      value: "http",
    },
    description: "Share a URL in a message",
    icon: "i-mdi:link-variant",
    points: 10,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.MessageEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a message",
    icon: "i-mdi:message-draw",
    points: 5,
    triggerPath: "message.updateMessage",
  }),
  [MessageAchievementName.MessageForwarder]: defineAchievementDefinition({
    amount: 1,
    description: "Forward a message to another room",
    icon: "i-mdi:share",
    points: 15,
    triggerPath: "message.forwardMessage",
  }),
  [MessageAchievementName.MessageMaster]: defineAchievementDefinition({
    amount: 1000,
    description: "Send 1,000 messages",
    icon: "i-mdi:message-star",
    points: 500,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.NightOwl]: defineAchievementDefinition({
    condition: { maximum: 5, minimum: 0, referenceUnit: "day", type: AchievementConditionType.Time, unit: "hour" },
    description: "Send a message between midnight and 5 AM",
    icon: "i-mdi:weather-night",
    points: 30,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.PinCollector]: defineAchievementDefinition({
    amount: 10,
    description: "Pin 10 important messages",
    icon: "i-mdi:pin",
    points: 50,
    triggerPath: "message.pinMessage",
  }),
  [MessageAchievementName.SecondThoughts]: defineAchievementDefinition({
    amount: 10,
    description: "Delete 10 of your own messages",
    icon: "i-mdi:delete",
    points: 20,
    triggerPath: "message.deleteMessage",
  }),
  [MessageAchievementName.ShortAndSweet]: defineAchievementDefinition({
    amount: 100,
    condition: {
      operator: BinaryOperator.Lt,
      path: "message.length",
      type: AchievementConditionType.Property,
      value: 10,
    },
    description: "Send 100 messages under 10 characters",
    icon: "i-mdi:message-flash",
    points: 50,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.Unpinner]: defineAchievementDefinition({
    amount: 1,
    description: "Unpin a message",
    icon: "i-mdi:pin-off",
    points: 5,
    triggerPath: "message.unpinMessage",
  }),
  [MessageAchievementName.Verbose]: defineAchievementDefinition({
    amount: 50,
    condition: {
      operator: BinaryOperator.Ge,
      path: "message.length",
      type: AchievementConditionType.Property,
      value: 500,
    },
    description: "Send 50 messages with 500-999 characters",
    icon: "i-mdi:text",
    points: 75,
    triggerPath: "message.createMessage",
  }),
});
