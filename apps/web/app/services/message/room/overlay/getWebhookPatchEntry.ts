import type { Entry } from "#src/models/shared/overlay/Entry";
import type { PublicWebhookInMessage } from "@esposter/db-schema";

import { webhookTable } from "#src/services/message/room/overlay/constants";

// An entry that sets the named fields of a webhook the overlay holds. A webhook it does not hold is left as it is, so the
// Write it belongs to changes nothing on screen
export const getWebhookPatchEntry =
  (id: PublicWebhookInMessage["id"], patch: Partial<PublicWebhookInMessage>): Entry =>
  (view) => {
    const webhook = view.get(webhookTable, [id]);
    if (webhook) view.set(webhookTable, [id], { ...webhook, ...patch });
  };
