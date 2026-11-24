import type { ClientMessage } from "#src/models/message/ClientMessage";

import { createHookRegistry } from "#src/services/shared/createHookRegistry";

// A store that keeps message rows beside the room's window registers a holder, which hands each row it holds for the
// Room to `hold`. The reconnect refresh reads every row handed over back, so a row a pin, a reply, a thread or a
// Followed root holds is refreshed or removed through the same funnel as the window's, and not left to stay as it was
// When the socket dropped
export const messageHolderRegistry =
  createHookRegistry<(roomId: string, hold: (messages: ClientMessage[]) => void) => void>();
