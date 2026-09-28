import type { DriverCommand } from "#src/models/command/DriverCommand";
import type { Driver } from "#src/models/driver/Driver";
import type { DriverCallbacks } from "#src/models/driver/DriverCallbacks";
import type { ChildMessage } from "#src/models/window/ChildMessage";
import type { SessionChild } from "#src/models/window/SessionChild";
import type { WindowDriverOptions } from "#src/models/window/WindowDriverOptions";
import type { WindowSession } from "#src/models/window/WindowSession";
import type { RawData, WebSocket } from "ws";

import { CommandType } from "#src/models/command/CommandType";
import { AgentEventType } from "#src/models/event/AgentEventType";
import { SessionState } from "#src/models/session/SessionState";
import { childMessageSchema } from "#src/models/window/ChildMessage";
import { ChildMessageType } from "#src/models/window/ChildMessageType";
import { DEFAULT_HOSTNAME } from "#src/services/constants";
import { listSessionSummaries } from "#src/services/drivers/claudeAgentSdk/listSessionSummaries";
import { readSessionCwd } from "#src/services/drivers/claudeAgentSdk/readSessionCwd";
import { toSessionClosedEvents } from "#src/services/drivers/claudeAgentSdk/toSessionClosedEvents";
import { SESSION_SECRET_BYTE_LENGTH, SESSION_WINDOW_CONNECT_TIMEOUT } from "#src/services/drivers/window/constants";
import { sendChildCommand } from "#src/services/drivers/window/sendChildCommand";
import { takeChildReply } from "#src/services/drivers/window/takeChildReply";
import { checkIsTokenValid } from "#src/services/server/checkIsTokenValid";
import { createTaskRegistry } from "#src/services/shared/createTaskRegistry";
import { readMessageText } from "#src/services/shared/readMessageText";
import { exhaustiveGuard, getResult, getResultAsync, InvalidOperationError, noop, Operation } from "@esposter/shared";
import { randomBytes } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";
import { WebSocketServer } from "ws";

// Each session in a window of its own: opening one starts a window running the Claude Agent SDK driver for that one
// Session, which connects back over a loopback listener of the host's own — never the pages', so it is never reachable
// From the network whatever address the pages' is — under a secret only that window was given, once. Commands go to the
// Window holding the session, and its events come back through the host to every page. The window's socket is the
// Session's life: closing the session closes the socket, which ends the window, and a window that closes takes its
// Session with it.
export const createWindowDriver = (
  { onEvents, onSessionOpen, onSessionsChange }: DriverCallbacks,
  { launchSessionWindow, writeLine }: WindowDriverOptions,
): Driver => {
  const windowSessionMap = new Map<string, WindowSession>();
  const childSet = new Set<SessionChild>();
  const pendingLaunchMap = new Map<string, { connection: PromiseWithResolvers<WebSocket>; timeout: NodeJS.Timeout }>();
  const taskRegistry = createTaskRegistry();
  const webSocketServer = new WebSocketServer({ noServer: true });
  const httpServer = createServer((_request, response) => {
    response.writeHead(405).end();
  });
  // A secret admits one window, once, and only until it expires
  httpServer.on("upgrade", (request, socket, head) => {
    const secret = request.headers.authorization?.replace(/^Bearer /u, "") ?? "";
    const pendingLaunchEntry = [...pendingLaunchMap].find(([launchSecret]) => checkIsTokenValid(secret, launchSecret));
    if (!pendingLaunchEntry) {
      socket.end("HTTP/1.1 401 Unauthorized\r\n\r\n");
      return;
    }

    const [launchSecret, { connection, timeout }] = pendingLaunchEntry;
    pendingLaunchMap.delete(launchSecret);
    clearTimeout(timeout);
    webSocketServer.handleUpgrade(request, socket, head, (webSocket) => {
      connection.resolve(webSocket);
    });
  });
  // Listens on the first window opened, on a port of its own the window is told
  let listening: Promise<number> | undefined;
  const listen = async () => {
    httpServer.listen(0, DEFAULT_HOSTNAME);
    await once(httpServer, "listening");
    const address = httpServer.address();
    return typeof address === "object" && address ? address.port : 0;
  };

  const getWindowSession = (sessionId: string) => {
    const windowSession = windowSessionMap.get(sessionId);
    if (!windowSession)
      throw new InvalidOperationError(Operation.Read, sessionId, "the session is not open on this host");
    return windowSession;
  };

  // Takes a session off the host at once and ends its window. The closed state is reported here unless the window
  // Already reported it, and a session reopened in another window since is left alone
  const closeWindowSession = (sessionId: string, windowSession: WindowSession) => {
    if (windowSessionMap.get(sessionId) !== windowSession) return;
    windowSessionMap.delete(sessionId);
    if (windowSession.state !== SessionState.Closed) onEvents(sessionId, toSessionClosedEvents(""));
    writeLine(`A session in ${windowSession.child.cwd} closed, and its window with it.`);
    onSessionsChange();
    windowSession.child.webSocket.close();
  };

  const handleChildMessage = (child: SessionChild, childMessage: ChildMessage) => {
    switch (childMessage.type) {
      case ChildMessageType.CommandError: {
        const reply = takeChildReply(child, childMessage.commandId);
        // oxlint-disable-next-line error-handling/no-bare-error -- re-raises the window's own error, whose message is already the one the page shows
        if (reply) reply.reject(new Error(childMessage.message));
        else console.error(childMessage.message);
        return;
      }
      case ChildMessageType.CommandResult:
        takeChildReply(child, childMessage.commandId)?.resolve(childMessage.sessionId);
        return;
      case ChildMessageType.Events: {
        const { events, sessionId } = childMessage;
        const windowSession = windowSessionMap.get(sessionId);
        const isHeld = windowSession?.child === child;
        if (isHeld) {
          windowSession.lastActivityAt = new Date();
          for (const event of events) if (event.type === AgentEventType.SessionState) windowSession.state = event.state;
        }
        onEvents(sessionId, events);
        // A session that ended on its own — its Claude Code process exited — ends its window too
        if (isHeld && windowSession.state === SessionState.Closed) closeWindowSession(sessionId, windowSession);
        return;
      }
      case ChildMessageType.SessionOpen:
        windowSessionMap.set(childMessage.sessionId, {
          child,
          cwd: child.cwd,
          lastActivityAt: new Date(),
          state: SessionState.Idle,
          title: "",
        });
        writeLine(`A session in ${child.cwd} opened in a window of its own.`);
        onSessionOpen(childMessage.sessionId);
        return;
      case ChildMessageType.SessionsChange:
        onSessionsChange();
        return;
      default:
        exhaustiveGuard(childMessage);
    }
  };

  const receive = (child: SessionChild, data: RawData) => {
    getResult(
      // oxlint-disable-next-line no-restricted-properties -- the child message schema validates the payload and coerces its dates, the pair /docs/architecture/serialization.md names
      () => childMessageSchema.parse(JSON.parse(readMessageText(data))),
    ).match((childMessage) => {
      handleChildMessage(child, childMessage);
    }, console.error);
  };

  // A window that closed — from its own close button or Ctrl+C, or ended by the host — fails what it still owed and
  // Closes the session it held
  const removeChild = (child: SessionChild) => {
    childSet.delete(child);
    for (const reply of child.pendingReplyMap.values())
      reply.reject(new InvalidOperationError(Operation.Update, child.cwd, "the session's window closed"));
    child.pendingReplyMap.clear();
    for (const [sessionId, windowSession] of windowSessionMap)
      if (windowSession.child === child) closeWindowSession(sessionId, windowSession);
  };

  const openWindow = async (cwd: string): Promise<SessionChild> => {
    const port = await (listening ??= listen());
    const secret = randomBytes(SESSION_SECRET_BYTE_LENGTH).toString("base64url");
    const connection = Promise.withResolvers<WebSocket>();
    const timeout = setTimeout(() => {
      pendingLaunchMap.delete(secret);
      connection.reject(new InvalidOperationError(Operation.Create, cwd, "the session's window did not start"));
    }, SESSION_WINDOW_CONNECT_TIMEOUT);
    pendingLaunchMap.set(secret, { connection, timeout });
    launchSessionWindow({ port, secret });
    const webSocket = await connection.promise;
    const child: SessionChild = { cwd, pendingReplyMap: new Map(), webSocket };
    childSet.add(child);
    webSocket.on("message", (data) => {
      receive(child, data);
    });
    webSocket.on("close", () => {
      removeChild(child);
    });
    return child;
  };

  // A window whose opening command fails holds no session, and is ended rather than left open empty
  const openInWindow = async (cwd: string, command: DriverCommand): Promise<string> => {
    const child = await openWindow(cwd);
    return getResultAsync(() => sendChildCommand(child, command)).match(
      (sessionId) => sessionId,
      (error) => {
        child.webSocket.close();
        throw error;
      },
    );
  };

  const forward = (sessionId: string, command: DriverCommand) =>
    sendChildCommand(getWindowSession(sessionId).child, command);
  // The commands the page is not answered for: a window that fails one says so in the host's log
  const forwardInBackground = (sessionId: string, command: DriverCommand) => {
    const reply = forward(sessionId, command);
    taskRegistry.run(() => getResultAsync(() => reply).match(noop, console.error));
  };

  const resumeSession = async (sessionId: string) => {
    if (windowSessionMap.has(sessionId)) return sessionId;
    return openInWindow(await readSessionCwd(sessionId), {
      id: crypto.randomUUID(),
      sessionId,
      type: CommandType.Resume,
    });
  };

  return {
    close: async () => {
      for (const { connection, timeout } of pendingLaunchMap.values()) {
        clearTimeout(timeout);
        connection.reject(new InvalidOperationError(Operation.Create, createWindowDriver.name, "the host is stopping"));
      }
      pendingLaunchMap.clear();
      const children = [...childSet];
      for (const { webSocket } of children) webSocket.terminate();
      await Promise.all(children.map(({ webSocket }) => once(webSocket, "close")));
      await taskRegistry.drain();
      if (!listening) return;
      await listening;
      httpServer.close();
      await once(httpServer, "close");
    },
    closeSession: (sessionId) => {
      closeWindowSession(sessionId, getWindowSession(sessionId));
    },
    createSession: (cwd) => openInWindow(cwd, { cwd, id: crypto.randomUUID(), type: CommandType.CreateSession }),
    forkSession: async (sessionId, messageUuid) =>
      openInWindow(await readSessionCwd(sessionId), {
        id: crypto.randomUUID(),
        messageUuid,
        sessionId,
        type: CommandType.Fork,
      }),
    interrupt: async (sessionId) => {
      await forward(sessionId, { id: crypto.randomUUID(), sessionId, type: CommandType.Interrupt });
    },
    listSessions: () => listSessionSummaries(windowSessionMap),
    prompt: (sessionId, text, attachments) => {
      forwardInBackground(sessionId, {
        attachments,
        id: crypto.randomUUID(),
        sessionId,
        text,
        type: CommandType.Prompt,
      });
    },
    resolvePermission: (sessionId, requestId, behavior, message) => {
      forwardInBackground(sessionId, {
        behavior,
        id: crypto.randomUUID(),
        message,
        requestId,
        sessionId,
        type: CommandType.PermissionVerdict,
      });
    },
    // A session resumed to an earlier message opens in a new window, the one holding it now closing first
    resumeAt: async (sessionId, messageUuid) => {
      const cwd = await readSessionCwd(sessionId);
      const windowSession = windowSessionMap.get(sessionId);
      if (windowSession) closeWindowSession(sessionId, windowSession);
      return openInWindow(cwd, { id: crypto.randomUUID(), messageUuid, sessionId, type: CommandType.ResumeAt });
    },
    resumeSession,
    rewindFiles: async (sessionId, messageUuid) => {
      await resumeSession(sessionId);
      await forward(sessionId, { id: crypto.randomUUID(), messageUuid, sessionId, type: CommandType.RewindFiles });
    },
    runSlashCommand: (sessionId, name, commandArguments) => {
      forwardInBackground(sessionId, {
        arguments: commandArguments,
        id: crypto.randomUUID(),
        name,
        sessionId,
        type: CommandType.SlashCommand,
      });
    },
    setModel: async (sessionId, model) => {
      await forward(sessionId, { id: crypto.randomUUID(), model, sessionId, type: CommandType.SetModel });
    },
    setPermissionMode: async (sessionId, permissionMode) => {
      await forward(sessionId, {
        id: crypto.randomUUID(),
        permissionMode,
        sessionId,
        type: CommandType.SetPermissionMode,
      });
    },
  };
};
