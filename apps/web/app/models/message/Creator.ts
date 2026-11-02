import type { AppUserInMessage } from "@esposter/db-schema";

// Who a message is drawn under: the identity alone, since a webhook's app user and an author nobody can resolve carry no more
export type Creator = Pick<AppUserInMessage, "id" | "image" | "name">;
