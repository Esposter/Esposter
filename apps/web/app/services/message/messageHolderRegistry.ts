import type { ClientMessage } from "#src/models/message/ClientMessage";

import { createHookRegistry } from "#src/services/shared/createHookRegistry";

// A store that keeps message rows beside the room's window registers a holder, which hands each row it holds for the room
// To `hold`. The reconnect refresh reads every row handed over back, so a row a pin, a reply, a thread or a followed root
// Holds is refreshed or removed through the same funnel as the window's, and not left to stay as it was when the socket dropped
export const messageHolderRegistry =
  createHookRegistry<(roomId: string, hold: (messages: ClientMessage[]) => void) => void>();
