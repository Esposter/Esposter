// @unocss-include
import { AchievementCategory } from "#shared/models/achievement/AchievementCategory";
import { defineAchievementDefinition } from "#shared/services/achievement/definitions/defineAchievementDefinition";
import { defineAchievementDefinitionMap } from "#shared/services/achievement/definitions/defineAchievementDefinitionMap";
import { countEmojis } from "#shared/util/text/countEmojis";
import { MessageAchievementName, standardCreateMessageInputSchema } from "@esposter/db-schema";
import { deleteMessageInputSchema } from "#shared/models/db/message/DeleteMessageInput";
import { forwardMessageInputSchema } from "#shared/models/db/message/ForwardMessageInput";
import { messageCompositeKeySchema } from "#shared/models/db/message/MessageCompositeKey";
import { updateMessageInputSchema } from "#shared/models/db/message/UpdateMessageInput";
import { contains } from "#shared/services/achievement/conditions/contains";
import { isAtLeast } from "#shared/services/achievement/conditions/isAtLeast";
import { isGreaterThan } from "#shared/services/achievement/conditions/isGreaterThan";
import { isLessThan } from "#shared/services/achievement/conditions/isLessThan";
import { isWithinTime } from "#shared/services/achievement/conditions/isWithinTime";
import { length } from "#shared/services/achievement/conditions/length";
import { property } from "#shared/services/achievement/conditions/property";

export const MessageAchievementDefinitionMap = defineAchievementDefinitionMap(AchievementCategory.Message, {
  [MessageAchievementName.CenturyClub]: defineAchievementDefinition({
    amount: 100,
    description: "Send 100 messages",
    icon: "i-mdi:message",
    points: 100,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.Chatterbox]: defineAchievementDefinition({
    amount: 500,
    description: "Send 500 messages",
    icon: "i-mdi:message-processing",
    points: 250,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.ConversationKeeper]: defineAchievementDefinition({
    amount: 50,
    condition: property("replyRowKey", Boolean),
    description: "Reply to 50 messages",
    icon: "i-mdi:reply",
    points: 75,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.EarlyBird]: defineAchievementDefinition({
    condition: isWithinTime({ maximum: 7, minimum: 5, referenceUnit: "day", unit: "hour" }),
    description: "Send a message between 5-7 AM",
    icon: "i-mdi:weather-sunset-up",
    points: 25,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.EmojiMaster]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", (value) => (value ? countEmojis(value) >= 1 : false)),
    description: "Send a message with an emoji",
    icon: "i-mdi:emoticon-cool",
    points: 15,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.EssayWriter]: defineAchievementDefinition({
    condition: property("message", length(isAtLeast(1000))),
    description: "Send a message with over 1,000 characters",
    icon: "i-mdi:text-long",
    points: 40,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.FileSharer]: defineAchievementDefinition({
    amount: 1,
    condition: property("files", length(isGreaterThan(0))),
    description: "Share your first file",
    icon: "i-mdi:file-upload",
    points: 20,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.FirstMessage]: defineAchievementDefinition({
    amount: 1,
    description: "Send your first message",
    icon: "i-mdi:message-text",
    points: 10,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.Gossip]: defineAchievementDefinition({
    amount: 50,
    description: "Forward 50 messages",
    icon: "i-mdi:share-variant",
    points: 100,
    inputSchema: forwardMessageInputSchema,
    triggerPath: "message.forwardMessage",
  }),
  [MessageAchievementName.LinkSharer]: defineAchievementDefinition({
    amount: 1,
    condition: property("message", contains("http")),
    description: "Share a URL in a message",
    icon: "i-mdi:link-variant",
    points: 10,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.MessageEditor]: defineAchievementDefinition({
    amount: 1,
    description: "Edit a message",
    icon: "i-mdi:message-draw",
    points: 5,
    inputSchema: updateMessageInputSchema,
    triggerPath: "message.updateMessage",
  }),
  [MessageAchievementName.MessageForwarder]: defineAchievementDefinition({
    amount: 1,
    description: "Forward a message to another room",
    icon: "i-mdi:share",
    points: 15,
    inputSchema: forwardMessageInputSchema,
    triggerPath: "message.forwardMessage",
  }),
  [MessageAchievementName.MessageMaster]: defineAchievementDefinition({
    amount: 1000,
    description: "Send 1,000 messages",
    icon: "i-mdi:message-star",
    points: 500,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.NightOwl]: defineAchievementDefinition({
    condition: isWithinTime({ maximum: 5, minimum: 0, referenceUnit: "day", unit: "hour" }),
    description: "Send a message between midnight and 5 AM",
    icon: "i-mdi:weather-night",
    points: 30,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.PinCollector]: defineAchievementDefinition({
    amount: 10,
    description: "Pin 10 important messages",
    icon: "i-mdi:pin",
    points: 50,
    inputSchema: messageCompositeKeySchema,
    triggerPath: "message.pinMessage",
  }),
  [MessageAchievementName.SecondThoughts]: defineAchievementDefinition({
    amount: 10,
    description: "Delete 10 of your own messages",
    icon: "i-mdi:delete",
    points: 20,
    inputSchema: deleteMessageInputSchema,
    triggerPath: "message.deleteMessage",
  }),
  [MessageAchievementName.ShortAndSweet]: defineAchievementDefinition({
    amount: 100,
    condition: property("message", length(isLessThan(10))),
    description: "Send 100 messages under 10 characters",
    icon: "i-mdi:message-flash",
    points: 50,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
  [MessageAchievementName.Unpinner]: defineAchievementDefinition({
    amount: 1,
    description: "Unpin a message",
    icon: "i-mdi:pin-off",
    points: 5,
    inputSchema: messageCompositeKeySchema,
    triggerPath: "message.unpinMessage",
  }),
  [MessageAchievementName.Verbose]: defineAchievementDefinition({
    amount: 50,
    condition: property("message", length(isAtLeast(500))),
    description: "Send 50 messages with 500-999 characters",
    icon: "i-mdi:text",
    points: 75,
    inputSchema: standardCreateMessageInputSchema,
    triggerPath: "message.createMessage",
  }),
});
