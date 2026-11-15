import type { NamedAppUserInMessage } from "#shared/models/db/webhook/NamedAppUserInMessage";

// Who a message is drawn under: the identity alone, since a webhook's app user and an author nobody can resolve carry
// No more
export type Creator = Pick<NamedAppUserInMessage, "id" | "image" | "name">;
