import type { WebhookInMessage } from "#src/schema/message/webhooksInMessage";
import type { Except } from "type-fest";

// The webhook as a room's settings may show it: every column but the hash of its credential. The credential is shown
// Once, in the response that issues it, and no read carries even its hash
export type PublicWebhookInMessage = Except<WebhookInMessage, "tokenHash">;
