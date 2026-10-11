import type { KitContext } from "#src/models/kit/KitContext";

import { emitKitEvent } from "#src/services/kit/emitKitEvent";

// The events waiting in the outbox sent in the order they were raised, an event raised while they are sent sent after
// Them, and the outbox emptied
export const sendKitOutbox = (context: KitContext): void => {
  const { outbox } = context;
  for (const event of outbox) emitKitEvent(event, context);
  outbox.length = 0;
};
