// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { forwardMessageInputSchema } from "#shared/models/db/message/ForwardMessageInput";
import { messageCompositeKeySchema } from "#shared/models/db/message/MessageCompositeKey";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { zonedCreateMessageInputSchema } from "#shared/models/db/message/ZonedCreateMessageInput";
import { contains } from "#shared/services/achievement/conditions/contains";
import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { isGreaterThan } from "#shared/services/achievement/conditions/isGreaterThan";
import { isLessThan } from "#shared/services/achievement/conditions/isLessThan";
import { isWithinTime } from "#shared/services/achievement/conditions/isWithinTime";
import { length } from "#shared/services/achievement/conditions/length";
import { property } from "#shared/services/achievement/conditions/property";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { countEmojis } from "#shared/util/text/countEmojis";
import { MessageAchievementName } from "@esposter/db-schema";

export const MessageAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Message, {
  [MessageAchievementName.CenturyClub]: defineAchievementDefinition({
    amount: 100,
    description: "Send 100 messages",
    icon: "i-mdi:message",
    inputSchema: zonedCreateMessageInputSchema,
    points: 100,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.Chatterbox]: defineAchievementDefinition({
    amount: 500,
    description: "Send 500 messages",
    icon: "i-mdi:message-processing",
    inputSchema: zonedCreateMessageInputSchema,
    points: 250,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.ConversationKeeper]: defineAchievementDefinition({
    amount: 50,
    condition: property("replyRowKey", Boolean),
    description: "Reply to 50 messages",
    icon: "i-mdi:reply",
    inputSchema: zonedCreateMessageInputSchema,
    points: 75,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.EarlyBird]: defineAchievementDefinition({
    condition: isWithinTime({ maximum: 7, minimum: 5, referenceUnit: "day", unit: "hour" }),
    description: "Send a message between 5-7 AM",
    icon: "i-mdi:weather-sunset-up",
    inputSchema: zonedCreateMessageInputSchema,
    points: 25,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.EmojiMaster]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", (value) => (value ? countEmojis(value) >= 1 : false)),
    description: "Send a message with an emoji",
    icon: "i-mdi:emoticon-cool",
    inputSchema: zonedCreateMessageInputSchema,
    points: 15,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.EssayWriter]: defineAchievementDefinition({
    condition: property("message", length(isAtLeast(1000))),
    description: "Send a message with over 1,000 characters",
    icon: "i-mdi:text-long",
    inputSchema: zonedCreateMessageInputSchema,
    points: 40,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.FileSharer]: defineAchievementDefinition({
    amount: 1,
    condition: property("files", length(isGreaterThan(0))),
    description: "Share your first file",
    icon: "i-mdi:file-upload",
    inputSchema: zonedCreateMessageInputSchema,
    points: 20,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.FirstMessage]: defineAchievementDefinition({
    amount: 1,
    description: "Send your first message",
    icon: "i-mdi:message-text",
    inputSchema: zonedCreateMessageInputSchema,
    points: 10,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.Gossip]: defineAchievementDefinition({
    amount: 50,
    description: "Forward 50 messages",
    icon: "i-mdi:share-variant",
    inputSchema: forwardMessageInputSchema,
    points: 100,
    triggerPath: "message.forwardMessage",
  }),
  [MessageAchievementName.LinkSharer]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", contains("http")),
    description: "Share a URL in a message",
    icon: "i-mdi:link-variant",
    inputSchema: zonedCreateMessageInputSchema,
    points: 10,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.MessageEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a message",
    icon: "i-mdi:message-draw",
    inputSchema: updateMessageInputSchema,
    points: 5,
    triggerPath: "message.updateMessage",
  }),
  [MessageAchievementName.MessageForwarder]: defineAchievementDefinition({
    amount: 1,
    description: "Forward a message to another room",
    icon: "i-mdi:share",
    inputSchema: forwardMessageInputSchema,
    points: 15,
    triggerPath: "message.forwardMessage",
  }),
  [MessageAchievementName.MessageMaster]: defineAchievementDefinition({
    amount: 1000,
    description: "Send 1,000 messages",
    icon: "i-mdi:message-star",
    inputSchema: zonedCreateMessageInputSchema,
    points: 500,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.NightOwl]: defineAchievementDefinition({
    condition: isWithinTime({ maximum: 5, minimum: 0, referenceUnit: "day", unit: "hour" }),
    description: "Send a message between midnight and 5 AM",
    icon: "i-mdi:weather-night",
    inputSchema: zonedCreateMessageInputSchema,
    points: 30,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.PinCollector]: defineAchievementDefinition({
    amount: 10,
    description: "Pin 10 important messages",
    icon: "i-mdi:pin",
    inputSchema: messageCompositeKeySchema,
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
  [MessageAchievementName.ShortAndSweet]: defineAchievementDefinition({
    amount: 100,
    condition: property("message", length(isLessThan(10))),
    description: "Send 100 messages under 10 characters",
    icon: "i-mdi:message-flash",
    inputSchema: zonedCreateMessageInputSchema,
    points: 50,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.Unpinner]: defineAchievementDefinition({
    amount: 1,
    description: "Unpin a message",
    icon: "i-mdi:pin-off",
    inputSchema: messageCompositeKeySchema,
    points: 5,
    triggerPath: "message.unpinMessage",
  }),
  [MessageAchievementName.Verbose]: defineAchievementDefinition({
    amount: 50,
    condition: property("message", length(isAtLeast(500))),
    description: "Send 50 messages with 500-999 characters",
    icon: "i-mdi:text",
    inputSchema: zonedCreateMessageInputSchema,
    points: 75,
    triggerPath: "message.createMessage",
  }),
});
