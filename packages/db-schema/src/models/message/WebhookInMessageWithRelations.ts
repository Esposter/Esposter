import type { PublicUser } from "#src/models/user/PublicUser";
import type { RoomInMessage } from "#src/schema/message/roomsInMessage";
import type { WebhookInMessage } from "#src/schema/message/webhooksInMessage";

// The row `WebhookInMessageRelations` actually produces, so a procedure returning one can declare it rather
// Than infer a shape the caller cannot name
export type WebhookInMessageWithRelations = WebhookInMessage & { creator: PublicUser; room: RoomInMessage };
