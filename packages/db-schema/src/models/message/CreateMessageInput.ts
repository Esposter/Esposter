import type { ServerCreateMessageInput } from "#src/models/message/ServerCreateMessageInput";
import type { WebhookCreateMessageInput } from "#src/models/message/WebhookCreateMessageInput";

export type CreateMessageInput = ServerCreateMessageInput | WebhookCreateMessageInput;
