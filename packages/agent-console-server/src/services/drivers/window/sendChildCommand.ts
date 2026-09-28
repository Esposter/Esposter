import type { DriverCommand } from "#src/models/command/DriverCommand";
import type { SessionChild } from "#src/models/window/SessionChild";

import { InvalidOperationError, Operation } from "@esposter/shared";
import { WebSocket } from "ws";

// Forwards a command to a session's window, resolving to the session it opened for an opening command and "" for
// Any other. A window already gone fails at once, since a reply would never come
export const sendChildCommand = (child: SessionChild, command: DriverCommand): Promise<string> => {
  if (child.webSocket.readyState !== WebSocket.OPEN)
    throw new InvalidOperationError(Operation.Update, child.cwd, "the session's window closed");
  const reply = Promise.withResolvers<string>();
  child.pendingReplyMap.set(command.id, reply);
  child.webSocket.send(JSON.stringify(command));
  return reply.promise;
};
