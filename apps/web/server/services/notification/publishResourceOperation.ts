import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";

import { useEventGridPublisherClient } from "@@/server/composables/azure/eventGrid/useEventGridPublisherClient";
import { AppNotificationType, publishNotification } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// A resource operation reaches the owner's other devices. The session that performed it is excluded: it showed
// The toast synchronously the moment the mutation resolved, so a push to it would be the same news twice.
//
// Best-effort, and always after the write it reports ([persist then notify](/docs/architecture/persist-then-notify)):
// A failed publish costs one notification, never the operation that already landed.
export const publishResourceOperation = async (
  { session, user }: GetSessionPayload,
  { path, title }: { path: string; title: string },
): Promise<void> => {
  await getResultAsync(() =>
    publishNotification(useEventGridPublisherClient(), {
      excludedSessionId: session.id,
      path,
      title,
      type: AppNotificationType.ResourceOperation,
      userId: user.id,
    }),
  ).match(noop, console.error);
};
