import type { Driver } from "#src/models/driver/Driver";
import type { DriverCallbacks } from "#src/models/driver/DriverCallbacks";
import type { ChildMessage } from "#src/models/window/ChildMessage";

import { commandSchema } from "#src/models/command/Command";
import { ChildMessageType } from "#src/models/window/ChildMessageType";
import { formatSessionLogLine } from "#src/services/drivers/window/formatSessionLogLine";
import { handleCommand } from "#src/services/server/handleCommand";
import { createTaskRegistry } from "#src/services/shared/createTaskRegistry";
import { readMessageText } from "#src/services/shared/readMessageText";
import { getResult, getResultAsync } from "@esposter/shared";
import { once } from "node:events";
import { WebSocket } from "ws";

// The window's half: runs the host's commands against a driver of its own, sends its callbacks and replies back up the
// Socket, and prints the conversation as it happens. It resolves once the socket has closed — the host ending the
// Session, or the host gone — and the driver has closed what it held
export const serveSessionChild = async (
  webSocket: WebSocket,
  createDriver: (callbacks: DriverCallbacks) => Driver,
  writeLine: (line: string) => void,
): Promise<void> => {
  const taskRegistry = createTaskRegistry();
  const send = (childMessage: ChildMessage) => {
    if (webSocket.readyState === WebSocket.OPEN) webSocket.send(JSON.stringify(childMessage));
  };
  const driver = createDriver({
    onEvents: (sessionId, events) => {
      for (const event of events) {
        const line = formatSessionLogLine(event);
        if (line) writeLine(line);
      }
      send({ events, sessionId, type: ChildMessageType.Events });
    },
    onSessionOpen: (sessionId) => {
      send({ sessionId, type: ChildMessageType.SessionOpen });
    },
    onSessionsChange: () => {
      send({ type: ChildMessageType.SessionsChange });
    },
  });

  const receive = async (text: string) => {
    const command = getResult(
      // oxlint-disable-next-line no-restricted-properties -- the command schema validates the payload and coerces its dates, the pair /docs/architecture/serialization.md names
      () => commandSchema.parse(JSON.parse(text)),
    )
      .orTee((error) => {
        send({ commandId: "", message: error.message, type: ChildMessageType.CommandError });
      })
      .unwrapOr(undefined);
    if (!command) return;

    await getResultAsync(() => handleCommand(driver, command)).match(
      (sessionId) => {
        send({ commandId: command.id, sessionId, type: ChildMessageType.CommandResult });
      },
      (error) => {
        send({ commandId: command.id, message: error.message, type: ChildMessageType.CommandError });
      },
    );
  };

  webSocket.on("message", (data) => {
    taskRegistry.run(() => receive(readMessageText(data)));
  });
  await once(webSocket, "close");
  await driver.close();
  await taskRegistry.drain();
};
