import type { SQLWrapper } from "drizzle-orm";

import { isNull } from "drizzle-orm";

// A webhook is live until its deletion leaves it as a tombstone. A delivery, a cap count, an edit and the name a bot posts
// Under each ask for live rows here, so a deleted webhook answers as an unknown one everywhere it is read
export const getLiveWebhookWhere = (webhook: { deletedAt: SQLWrapper }) => isNull(webhook.deletedAt);
