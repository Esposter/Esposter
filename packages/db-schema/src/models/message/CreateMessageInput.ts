import type { ServerCreateMessageInput } from "@/models/message/ServerCreateMessageInput";
import type { WebhookCreateMessageInput } from "@/models/message/WebhookCreateMessageInput";

export type CreateMessageInput = ServerCreateMessageInput | WebhookCreateMessageInput;
