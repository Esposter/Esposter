import type { PublicUser } from "#src/models/user/PublicUser";
import type { PublicWebhookInMessage } from "#src/models/message/PublicWebhookInMessage";
import type { RoomInMessage } from "#src/schema/message/roomsInMessage";

// The row `WebhookInMessageRelations` actually produces, so a procedure returning one can declare it rather
// Than infer a shape the caller cannot name
export type WebhookInMessageWithRelations = PublicWebhookInMessage & { creator: PublicUser; room: RoomInMessage };
