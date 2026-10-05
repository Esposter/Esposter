import type { Driver } from "#src/models/driver/Driver";
import type { DriverCallbacks } from "#src/models/driver/DriverCallbacks";
import type { SessionWindowLaunch } from "#src/models/window/SessionWindowLaunch";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { SessionState } from "#src/models/session/SessionState";
import { ChildMessageType } from "#src/models/window/ChildMessageType";
import { DEFAULT_HOSTNAME } from "#src/services/constants";
import { hashCredential } from "#src/services/device/hashCredential";
import { writeStateFile } from "#src/services/device/writeStateFile";
import {
  SESSION_WINDOW_CONNECT_TIMEOUT_MS,
  SESSION_WINDOW_REJOIN_DURATION_MS,
  SESSION_WINDOWS_FILENAME,
} from "#src/services/drivers/window/constants";
import { createWindowDriver } from "#src/services/drivers/window/createWindowDriver";
import { readSessionWindows } from "#src/services/drivers/window/readSessionWindows";
import { serveSessionChild } from "#src/services/drivers/window/serveSessionChild";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { once } from "node:events";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { WebSocket } from "ws";

// A window's side of the loopback, presenting the secret its launch was given
const connect = ({ port, secret }: SessionWindowLaunch): WebSocket =>
  new WebSocket(`ws://${DEFAULT_HOSTNAME}:${port}`, { headers: { authorization: `Bearer ${secret}` } });

describe(createWindowDriver, () => {
  const sessionId = crypto.randomUUID();
  const runningEvent = {
    createdAt: new Date(0),
    id: " ",
    state: SessionState.Running,
    type: AgentEventType.SessionState,
  } as const;
  const onEvents = vi.fn<DriverCallbacks["onEvents"]>();
  const onSessionOpen = vi.fn<DriverCallbacks["onSessionOpen"]>();
  const onSessionsChange = vi.fn<DriverCallbacks["onSessionsChange"]>();
  const childClose = vi.fn<Driver["close"]>();
  const childInterrupt = vi.fn<Driver["interrupt"]>();
  const launchSessionWindow = vi.fn<(sessionWindowLaunch: SessionWindowLaunch) => void>();
  let driver: Driver;
  let stateDirectory: string;
  let sessionWindowLaunch: SessionWindowLaunch;
  let serving: Promise<void>;
  let childAbortController: AbortController;
  let childWebSocket: WebSocket;
  let childCallbacks: DriverCallbacks;
  // Where a window that lost its host reads the next host's port from
  let rejoinStateDirectory: string;

  beforeEach(() => {
    stateDirectory = mkdtempSync(join(tmpdir(), "agent-console-server-"));
    rejoinStateDirectory = stateDirectory;
    childClose.mockResolvedValue();
    childInterrupt.mockResolvedValue();
    // A window started in the test's own process: the child's half runs for real over the loopback, against a driver
    // Double, so nothing is spawned
    launchSessionWindow.mockImplementation((newSessionWindowLaunch) => {
      sessionWindowLaunch = newSessionWindowLaunch;
      childAbortController = new AbortController();
      let isFirstConnection = true;
      serving = serveSessionChild(
        // First to the port it was launched with, as a window does, then to whichever host the state directory names
        () => {
          const port = isFirstConnection ? newSessionWindowLaunch.port : readSessionWindows(rejoinStateDirectory).port;
          isFirstConnection = false;
          childWebSocket = connect({ port, secret: newSessionWindowLaunch.secret });
          return childWebSocket;
        },
        (newChildCallbacks) => {
          childCallbacks = newChildCallbacks;
          return {
            backgroundTasks: vi.fn<Driver["backgroundTasks"]>(),
            close: childClose,
            closeSession: vi.fn<Driver["closeSession"]>(),
            createSession: () => {
              childCallbacks.onSessionOpen(sessionId);
              return Promise.resolve(sessionId);
            },
            forkSession: vi.fn<Driver["forkSession"]>(),
            interrupt: childInterrupt,
            listSessions: vi.fn<Driver["listSessions"]>(),
            prompt: vi.fn<Driver["prompt"]>(),
            resolvePermission: vi.fn<Driver["resolvePermission"]>(),
            resumeAt: vi.fn<Driver["resumeAt"]>(),
            resumeSession: vi.fn<Driver["resumeSession"]>(),
            rewindFiles: vi.fn<Driver["rewindFiles"]>(),
            runSlashCommand: vi.fn<Driver["runSlashCommand"]>(),
            setModel: vi.fn<Driver["setModel"]>(),
            setPermissionMode: vi.fn<Driver["setPermissionMode"]>(),
            stopTask: vi.fn<Driver["stopTask"]>(),
          };
        },
        vi.fn<(line: string) => void>(),
        childAbortController.signal,
      );
    });
    driver = createWindowDriver(
      { onEvents, onSessionOpen, onSessionsChange },
      { launchSessionWindow, stateDirectory, writeLine: vi.fn<(line: string) => void>() },
    );
  });

  afterEach(async () => {
    vi.useRealTimers();
    await driver.close();
    await serving;
    rmSync(stateDirectory, { force: true, recursive: true });
    vi.resetAllMocks();
  });

  test("opens a session in a window of its own and forwards its commands to that window", async () => {
    expect.hasAssertions();

    await expect(driver.createSession(" ")).resolves.toBe(sessionId);

    await driver.interrupt(sessionId);

    expect(onSessionOpen).toHaveBeenCalledExactlyOnceWith(sessionId);
    expect(childInterrupt).toHaveBeenCalledExactlyOnceWith(sessionId);
  });

  test("fails a forwarded command with the window's own error", async () => {
    expect.hasAssertions();

    childInterrupt.mockRejectedValueOnce(new InvalidOperationError(Operation.Update, sessionId, " "));
    await driver.createSession(" ");

    await expect(driver.interrupt(sessionId)).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: ${new InvalidOperationError(Operation.Update, sessionId, " ").message}]`,
    );
  });

  test("closes the session when its window closes", async () => {
    expect.hasAssertions();

    await driver.createSession(" ");
    const sessionsChange = new Promise<void>((resolve) => {
      onSessionsChange.mockImplementation(() => {
        resolve();
      });
    });
    // The reader closing the window
    childAbortController.abort();
    await sessionsChange;

    const [closedSessionId, closedEvents] = onEvents.mock.lastCall ?? [];

    expect(closedSessionId).toBe(sessionId);
    expect(
      closedEvents?.map((event) => (event.type === AgentEventType.SessionState ? event.state : event.type)),
    ).toStrictEqual([SessionState.Closed]);
  });

  test("ends the window when its session is closed", async () => {
    expect.hasAssertions();

    await driver.createSession(" ");
    driver.closeSession(sessionId);
    await serving;

    expect(childClose).toHaveBeenCalledTimes(1);
    expect(() => {
      driver.closeSession(sessionId);
    }).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: ${new InvalidOperationError(Operation.Read, sessionId, "the session is not open on this host").message}]`,
    );
  });

  test("refuses a secret used once already", async () => {
    expect.hasAssertions();

    await driver.createSession(" ");
    const [error] = await once(connect(sessionWindowLaunch), "error");

    expect(error).toMatchInlineSnapshot(`[Error: Unexpected server response: 401]`);
  });

  test("refuses a secret once the window has taken too long to connect", async () => {
    expect.hasAssertions();

    vi.useFakeTimers({ toFake: ["setTimeout"] });
    const { promise: launched, resolve } = Promise.withResolvers<SessionWindowLaunch>();
    launchSessionWindow.mockImplementationOnce((newSessionWindowLaunch) => {
      resolve(newSessionWindowLaunch);
    });
    const opening = driver.createSession(" ");
    const expiredSessionWindowLaunch = await launched;
    vi.advanceTimersByTime(SESSION_WINDOW_CONNECT_TIMEOUT_MS);

    await expect(opening).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name:  , the session's window did not start]`,
    );

    const [error] = await once(connect(expiredSessionWindowLaunch), "error");

    expect(error).toMatchInlineSnapshot(`[Error: Unexpected server response: 401]`);
  });

  test("keeps its session when the host goes away without a word, and hands it to the next host", async () => {
    expect.hasAssertions();

    await driver.createSession(" ");
    childCallbacks.onEvents(sessionId, [
      { blockId: "", createdAt: new Date(0), id: "", isThinking: false, text: "", type: AgentEventType.StreamDelta },
      runningEvent,
    ]);
    rejoinStateDirectory = mkdtempSync(join(tmpdir(), "agent-console-server-"));
    writeStateFile(rejoinStateDirectory, SESSION_WINDOWS_FILENAME, JSON.stringify(readSessionWindows(stateDirectory)));
    const nextOnSessionOpen = vi.fn<DriverCallbacks["onSessionOpen"]>();
    const sessionOpen = new Promise<void>((resolve) => {
      nextOnSessionOpen.mockImplementation(() => {
        resolve();
      });
    });
    const nextOnEvents = vi.fn<DriverCallbacks["onEvents"]>();
    const nextDriver = createWindowDriver(
      {
        onEvents: nextOnEvents,
        onSessionOpen: nextOnSessionOpen,
        onSessionsChange: vi.fn<DriverCallbacks["onSessionsChange"]>(),
      },
      { launchSessionWindow, stateDirectory: rejoinStateDirectory, writeLine: vi.fn<(line: string) => void>() },
    );
    // The host killed: its socket drops with no close frame
    childWebSocket.terminate();
    await sessionOpen;

    expect(nextOnSessionOpen).toHaveBeenCalledExactlyOnceWith(sessionId);
    expect(nextOnEvents).toHaveBeenCalledExactlyOnceWith(sessionId, [runningEvent]);
    expect(childClose).not.toHaveBeenCalled();

    nextDriver.closeSession(sessionId);
    await serving;

    expect(childClose).toHaveBeenCalledTimes(1);

    await nextDriver.close();
    rmSync(rejoinStateDirectory, { force: true, recursive: true });
  });

  test("takes back a window the last host left open, with its session's log", async () => {
    expect.hasAssertions();

    const rejoiningSessionId = crypto.randomUUID();
    const secret = crypto.randomUUID();
    const events = [runningEvent];
    await driver.close();
    writeStateFile(
      stateDirectory,
      SESSION_WINDOWS_FILENAME,
      JSON.stringify({ port: 0, secretHashes: [hashCredential(secret)] }),
    );
    driver = createWindowDriver(
      { onEvents, onSessionOpen, onSessionsChange },
      { launchSessionWindow, stateDirectory, writeLine: vi.fn<(line: string) => void>() },
    );
    // A session opened in this host's own window first, which waits for the host to listen
    await driver.createSession(" ");
    const sessionsChange = new Promise<void>((resolve) => {
      onSessionsChange.mockImplementation(() => {
        resolve();
      });
    });
    const rejoiningWebSocket = connect({ port: readSessionWindows(stateDirectory).port, secret });
    await once(rejoiningWebSocket, "open");
    rejoiningWebSocket.send(
      JSON.stringify({ sessions: [{ events, sessionId: rejoiningSessionId }], type: ChildMessageType.Rejoin }),
    );
    await sessionsChange;

    expect(onSessionOpen).toHaveBeenLastCalledWith(rejoiningSessionId);
    expect(onEvents).toHaveBeenLastCalledWith(rejoiningSessionId, events);
    expect((await driver.listSessions()).find(({ id }) => id === rejoiningSessionId)?.state).toBe(SessionState.Running);

    rejoiningWebSocket.close();
    await once(rejoiningWebSocket, "close");
  });

  test("refuses a window the last host left open once it has had its chance", async () => {
    expect.hasAssertions();

    const secret = crypto.randomUUID();
    await driver.close();
    writeStateFile(
      stateDirectory,
      SESSION_WINDOWS_FILENAME,
      JSON.stringify({ port: 0, secretHashes: [hashCredential(secret)] }),
    );
    vi.useFakeTimers({ toFake: ["setTimeout"] });
    driver = createWindowDriver(
      { onEvents, onSessionOpen, onSessionsChange },
      { launchSessionWindow, stateDirectory, writeLine: vi.fn<(line: string) => void>() },
    );
    vi.advanceTimersByTime(SESSION_WINDOW_REJOIN_DURATION_MS);
    vi.useRealTimers();
    await driver.createSession(" ");
    const [error] = await once(connect({ port: readSessionWindows(stateDirectory).port, secret }), "error");

    expect(error).toMatchInlineSnapshot(`[Error: Unexpected server response: 401]`);
    expect(readSessionWindows(stateDirectory).secretHashes).toHaveLength(1);
  });
});
