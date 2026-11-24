import type { Entry } from "#src/models/shared/overlay/Entry";
import type { PublicWebhookInMessage } from "@esposter/db-schema";

import { webhookTable } from "#src/services/message/room/overlay/constants";
import { getHeldRowEntry } from "#src/services/shared/overlay/getHeldRowEntry";

// An entry that sets the named fields of a webhook the overlay holds.
// A webhook it does not hold is left as it is, so the write it belongs to changes nothing on screen.
export const getWebhookPatchEntry = (id: PublicWebhookInMessage["id"], patch: Partial<PublicWebhookInMessage>): Entry =>
  getHeldRowEntry(webhookTable, [id], (webhook) => ({ ...webhook, ...patch }));
