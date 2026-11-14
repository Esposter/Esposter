import type { PublicWebhookInMessage } from "#src/models/message/PublicWebhookInMessage";

// What a mutation issuing a webhook's credential answers with: the webhook, and the credential once. No later read
// Carries the credential, so the caller shows it there or never
export interface IssuedWebhookInMessage {
  token: string;
  webhook: PublicWebhookInMessage;
}
