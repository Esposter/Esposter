import type { Driver } from "#src/models/driver/Driver";
import type { DriverCallbacks } from "#src/models/driver/DriverCallbacks";
import type { SessionWindowLaunch } from "#src/models/window/SessionWindowLaunch";

import { AgentEventType } from "#src/models/event/AgentEventType";
import { SessionState } from "#src/models/session/SessionState";
import { DEFAULT_HOSTNAME } from "#src/services/constants";
import { SESSION_WINDOW_CONNECT_TIMEOUT } from "#src/services/drivers/window/constants";
import { createWindowDriver } from "#src/services/drivers/window/createWindowDriver";
import { serveSessionChild } from "#src/services/drivers/window/serveSessionChild";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { once } from "node:events";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { WebSocket } from "ws";

// A window's side of the loopback, presenting the secret its launch was given
const connect = ({ port, secret }: SessionWindowLaunch) =>
  new WebSocket(`ws://${DEFAULT_HOSTNAME}:${port}`, { headers: { authorization: `Bearer ${secret}` } });

describe(createWindowDriver, () => {
  const sessionId = crypto.randomUUID();
  const onEvents = vi.fn<DriverCallbacks["onEvents"]>();
  const onSessionOpen = vi.fn<DriverCallbacks["onSessionOpen"]>();
  const onSessionsChange = vi.fn<DriverCallbacks["onSessionsChange"]>();
  const childClose = vi.fn<Driver["close"]>();
  const childInterrupt = vi.fn<Driver["interrupt"]>();
  const launchSessionWindow = vi.fn<(sessionWindowLaunch: SessionWindowLaunch) => void>();
  let driver: Driver;
  let sessionWindowLaunch: SessionWindowLaunch;
  let serving: Promise<void>;
  let childWebSocket: WebSocket;

  beforeEach(() => {
    childClose.mockResolvedValue();
    childInterrupt.mockResolvedValue();
    // A window started in the test's own process: the child's half runs for real over the loopback, against a driver
    // Double, so nothing is spawned
    launchSessionWindow.mockImplementation((newSessionWindowLaunch) => {
      sessionWindowLaunch = newSessionWindowLaunch;
      childWebSocket = connect(newSessionWindowLaunch);
      serving = serveSessionChild(
        childWebSocket,
        (childCallbacks) => ({
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
        }),
        vi.fn<(line: string) => void>(),
      );
    });
    driver = createWindowDriver(
      { onEvents, onSessionOpen, onSessionsChange },
      { launchSessionWindow, writeLine: vi.fn<(line: string) => void>() },
    );
  });

  afterEach(async () => {
    vi.useRealTimers();
    await driver.close();
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
      onSessionsChange.mockImplementation(resolve);
    });
    // The reader closing the window: its socket goes
    childWebSocket.close();
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
    launchSessionWindow.mockImplementationOnce(resolve);
    const opening = driver.createSession(" ");
    const expiredSessionWindowLaunch = await launched;
    vi.advanceTimersByTime(SESSION_WINDOW_CONNECT_TIMEOUT);

    await expect(opening).rejects.toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Create, name:  , the session's window did not start]`,
    );

    const [error] = await once(connect(expiredSessionWindowLaunch), "error");

    expect(error).toMatchInlineSnapshot(`[Error: Unexpected server response: 401]`);
  });
});
