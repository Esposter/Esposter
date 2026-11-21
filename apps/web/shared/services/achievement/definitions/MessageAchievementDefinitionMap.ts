// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { forwardMessageInputSchema } from "#shared/models/db/message/ForwardMessageInput";
import { messageIdentityInputSchema } from "#shared/models/db/message/MessageIdentityInput";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { zonedCreateMessageInputSchema } from "#shared/models/db/message/ZonedCreateMessageInput";
import { contains } from "#shared/services/achievement/conditions/contains";
import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { isGreaterThan } from "#shared/services/achievement/conditions/isGreaterThan";
import { isLessThan } from "#shared/services/achievement/conditions/isLessThan";
import { isWithinTime } from "#shared/services/achievement/conditions/isWithinTime";
import { length } from "#shared/services/achievement/conditions/length";
import { property } from "#shared/services/achievement/conditions/property";
import {
  defineAchievementDefinition,
  defineTriggerAchievementDefinition,
} from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { countEmojis } from "#shared/util/text/countEmojis";
import { MessageAchievementName } from "@esposter/db-schema";

const defineCreateMessageAchievementDefinition = defineTriggerAchievementDefinition(
  "message.createMessage",
  zonedCreateMessageInputSchema,
);

const defineForwardMessageAchievementDefinition = defineTriggerAchievementDefinition(
  "message.forwardMessage",
  forwardMessageInputSchema,
);

export const MessageAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Message, {
  [MessageAchievementName.CenturyClub]: defineCreateMessageAchievementDefinition({
    amount: 100,
    description: "Send 100 messages",
    icon: "i-mdi:message",
    points: 100,
  }),
  [MessageAchievementName.Chatterbox]: defineCreateMessageAchievementDefinition({
    amount: 500,
    description: "Send 500 messages",
    icon: "i-mdi:message-processing",
    points: 250,
  }),
  [MessageAchievementName.ConversationKeeper]: defineCreateMessageAchievementDefinition({
    amount: 50,
    condition: property("replyToId", Boolean),
    description: "Reply to 50 messages",
    icon: "i-mdi:reply",
    points: 75,
  }),
  [MessageAchievementName.EarlyBird]: defineCreateMessageAchievementDefinition({
    condition: isWithinTime({ maximum: 7, minimum: 5, referenceUnit: "day", unit: "hour" }),
    description: "Send a message between 5-7 AM",
    icon: "i-mdi:weather-sunset-up",
    points: 25,
  }),
  [MessageAchievementName.EmojiMaster]: defineCreateMessageAchievementDefinition({
    amount: 1,
    condition: property("message", (value) => (value ? countEmojis(value) >= 1 : false)),
    description: "Send a message with an emoji",
    icon: "i-mdi:emoticon-cool",
    points: 15,
  }),
  [MessageAchievementName.EssayWriter]: defineCreateMessageAchievementDefinition({
    condition: property("message", length(isAtLeast(1000))),
    description: "Send a message with over 1,000 characters",
    icon: "i-mdi:text-long",
    points: 40,
  }),
  [MessageAchievementName.FileSharer]: defineCreateMessageAchievementDefinition({
    amount: 1,
    condition: property("files", length(isGreaterThan(0))),
    description: "Share your first file",
    icon: "i-mdi:file-upload",
    points: 20,
  }),
  [MessageAchievementName.FirstMessage]: defineCreateMessageAchievementDefinition({
    amount: 1,
    description: "Send your first message",
    icon: "i-mdi:message-text",
    points: 10,
  }),
  [MessageAchievementName.Gossip]: defineForwardMessageAchievementDefinition({
    amount: 50,
    description: "Forward 50 messages",
    icon: "i-mdi:share-variant",
    points: 100,
  }),
  [MessageAchievementName.LinkSharer]: defineCreateMessageAchievementDefinition({
    amount: 1,
    condition: property("message", contains("http")),
    description: "Share a URL in a message",
    icon: "i-mdi:link-variant",
    points: 10,
  }),
  [MessageAchievementName.MessageEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a message",
    icon: "i-mdi:message-draw",
    inputSchema: updateMessageInputSchema,
    points: 5,
    triggerPath: "message.updateMessage",
  }),
  [MessageAchievementName.MessageForwarder]: defineForwardMessageAchievementDefinition({
    amount: 1,
    description: "Forward a message to another room",
    icon: "i-mdi:share",
    points: 15,
  }),
  [MessageAchievementName.MessageMaster]: defineCreateMessageAchievementDefinition({
    amount: 1000,
    description: "Send 1,000 messages",
    icon: "i-mdi:message-star",
    points: 500,
  }),
  [MessageAchievementName.NightOwl]: defineCreateMessageAchievementDefinition({
    condition: isWithinTime({ maximum: 5, minimum: 0, referenceUnit: "day", unit: "hour" }),
    description: "Send a message between midnight and 5 AM",
    icon: "i-mdi:weather-night",
    points: 30,
  }),
  [MessageAchievementName.PinCollector]: defineAchievementDefinition({
    amount: 10,
    description: "Pin 10 important messages",
    icon: "i-mdi:pin",
    inputSchema: messageIdentityInputSchema,
    points: 50,
    triggerPath: "message.pinMessage",
  }),
  [MessageAchievementName.SecondThoughts]: defineAchievementDefinition({
    amount: 10,
    description: "Delete 10 of your own messages",
    icon: "i-mdi:delete",
    inputSchema: deleteMessageInputSchema,
    points: 20,
    triggerPath: "message.deleteMessage",
  }),
  [MessageAchievementName.ShortAndSweet]: defineCreateMessageAchievementDefinition({
    amount: 100,
    condition: property("message", length(isLessThan(10))),
    description: "Send 100 messages under 10 characters",
    icon: "i-mdi:message-flash",
    points: 50,
  }),
  [MessageAchievementName.Unpinner]: defineAchievementDefinition({
    amount: 1,
    description: "Unpin a message",
    icon: "i-mdi:pin-off",
    inputSchema: messageIdentityInputSchema,
    points: 5,
    triggerPath: "message.unpinMessage",
  }),
  [MessageAchievementName.Verbose]: defineCreateMessageAchievementDefinition({
    amount: 50,
    condition: property("message", length(isAtLeast(500))),
    description: "Send 50 messages with 500-999 characters",
    icon: "i-mdi:text",
    points: 75,
  }),
});
