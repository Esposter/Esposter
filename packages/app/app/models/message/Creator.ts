import type { User, WebhookMessageEntity } from "@esposter/db-schema";

export type Creator = User | WebhookMessageEntity["appUser"];
