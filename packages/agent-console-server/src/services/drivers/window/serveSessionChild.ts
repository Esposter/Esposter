import type { Driver } from "#src/models/driver/Driver";
import type { DriverCallbacks } from "#src/models/driver/DriverCallbacks";
import type { AgentEvent } from "#src/models/event/AgentEvent";
import type { ChildMessage } from "#src/models/window/ChildMessage";

import { driverCommandSchema } from "#src/models/command/DriverCommand";
import { AgentEventType } from "#src/models/event/AgentEventType";
import { SessionState } from "#src/models/session/SessionState";
import { ChildMessageType } from "#src/models/window/ChildMessageType";
import { SessionWindowCloseCode } from "#src/models/window/SessionWindowCloseCode";
import { SESSION_WINDOW_RECONNECT_DELAY } from "#src/services/drivers/window/constants";
import { formatSessionLogLine } from "#src/services/drivers/window/formatSessionLogLine";
import { handleCommand } from "#src/services/server/handleCommand";
import { createTaskRegistry } from "#src/services/shared/createTaskRegistry";
import { readMessageText } from "#src/services/shared/readMessageText";
import { getOrCreate, getResult, getResultAsync, noop } from "@esposter/shared";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { WebSocket } from "ws";

// The window's half: runs the host's commands against a driver of its own, sends its callbacks and replies back up the
// Socket, and prints the conversation as it happens. A host that ends the session, refuses the window or is left by it
// Ends the window: it resolves once the driver has closed what it held. A host that goes away without a word — killed,
// As a rebuild while developing kills it — leaves the session running: the window connects again until a host takes
// It back, and hands that host every session it holds with its whole log
export const serveSessionChild = async (
  connect: () => WebSocket,
  createDriver: (callbacks: DriverCallbacks) => Driver,
  writeLine: (line: string) => void,
  signal: AbortSignal,
): Promise<void> => {
  const taskRegistry = createTaskRegistry();
  // Every open session's events since it opened, which a host taking the window back replays to its pages
  const sessionEventMap = new Map<string, AgentEvent[]>();
  let webSocket: undefined | WebSocket;
  const send = (childMessage: ChildMessage) => {
    if (webSocket?.readyState === WebSocket.OPEN) webSocket.send(JSON.stringify(childMessage));
  };
  const driver = createDriver({
    onEvents: (sessionId, events) => {
      for (const event of events) {
        const line = formatSessionLogLine(event);
        if (line) writeLine(line);
      }
      getOrCreate(sessionEventMap, sessionId, () => []).push(...events);
      if (events.some((event) => event.type === AgentEventType.SessionState && event.state === SessionState.Closed))
        sessionEventMap.delete(sessionId);
      send({ events, sessionId, type: ChildMessageType.Events });
    },
    onSessionOpen: (sessionId) => {
      sessionEventMap.set(sessionId, []);
      send({ sessionId, type: ChildMessageType.SessionOpen });
    },
    onSessionsChange: () => {
      send({ type: ChildMessageType.SessionsChange });
    },
  });

  const receive = async (text: string) => {
    const command = getResult(
      // oxlint-disable-next-line no-restricted-properties -- the command schema validates the payload and coerces its dates, the pair /docs/architecture/serialization.md names
      () => driverCommandSchema.parse(JSON.parse(text)),
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

  // Closing the window, or Ctrl+C, ends the session: the host sees the socket go and shows it closed in every page
  signal.addEventListener("abort", () => {
    webSocket?.close();
  });
  let isRejoining = false;
  while (!signal.aborted) {
    const currentWebSocket = connect();
    webSocket = currentWebSocket;
    let isRefused = false;
    currentWebSocket.on("message", (data) => {
      taskRegistry.run(() => receive(readMessageText(data)));
    });
    // A host that is not up yet fails the attempt, which the loop makes again
    currentWebSocket.on("error", noop);
    currentWebSocket.on("unexpected-response", () => {
      isRefused = true;
      currentWebSocket.terminate();
    });
    if (isRejoining)
      currentWebSocket.once("open", () => {
        writeLine("The host is back, and has this session again.");
        send({
          sessions: Array.from(sessionEventMap, ([sessionId, events]) => ({ events, sessionId })),
          type: ChildMessageType.Rejoin,
        });
      });
    // oxlint-disable-next-line no-await-in-loop -- Reconnect: an attempt is made only once the one before it has closed
    const [code] = await once(currentWebSocket, "close");
    if (isRefused && isRejoining) writeLine("The host did not take this session back, so it ends here.");
    // A window that has opened no session yet has nothing to keep
    if (signal.aborted || isRefused || code === SessionWindowCloseCode.SessionEnded || sessionEventMap.size === 0)
      break;
    if (!isRejoining)
      writeLine("The host went away. This session keeps running, and comes back when the host is started again.");
    isRejoining = true;
    // oxlint-disable-next-line no-await-in-loop -- Reconnect: an attempt is made only once the one before it has closed
    await delay(SESSION_WINDOW_RECONNECT_DELAY);
  }
  await driver.close();
  await taskRegistry.drain();
};
