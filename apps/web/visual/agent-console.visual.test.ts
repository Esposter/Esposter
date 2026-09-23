import type { AgentConsoleServer, AgentEvent, DriverCallbacks, SessionSummary } from "agent-console-server";
import type { Page } from "playwright-core";

import { readRecordedEvents } from "@/services/agentConsole/readRecordedEvents.test";
import { RoutePath } from "@esposter/shared";
import { createPage, setup } from "@nuxt/test-utils/e2e";
import {
  AgentEventType,
  createAgentConsoleServer,
  DEFAULT_HOSTNAME,
  PAIRING_HASH_PARAMETER,
  SessionState,
  TOKEN_QUERY_PARAMETER,
} from "agent-console-server";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { afterAll, beforeAll, describe, expect, test, vi } from "vitest";

const SCREENSHOT_DIRECTORY = join(import.meta.dirname, "__screenshots__", "agent-console");
// A state with no baseline yet is written where its baseline goes and passes: committing it is approving it. A
// State with one is compared pixel by pixel, and a mismatch leaves the capture and the difference beside it
const compareWithBaseline = (screenshot: Buffer, name: string) => {
  const baselinePath = join(SCREENSHOT_DIRECTORY, `${name}.png`);
  if (!existsSync(baselinePath)) {
    mkdirSync(SCREENSHOT_DIRECTORY, { recursive: true });
    writeFileSync(baselinePath, screenshot);
    return 0;
  }

  const baseline = PNG.sync.read(readFileSync(baselinePath));
  const actual = PNG.sync.read(screenshot);
  if (baseline.width !== actual.width || baseline.height !== actual.height) return Number.POSITIVE_INFINITY;
  const difference = new PNG({ height: baseline.height, width: baseline.width });
  const mismatchedPixelCount = pixelmatch(
    baseline.data,
    actual.data,
    difference.data,
    baseline.width,
    baseline.height,
    {
      threshold: 0.1,
    },
  );
  if (mismatchedPixelCount > 0) {
    writeFileSync(join(SCREENSHOT_DIRECTORY, `${name}.actual.png`), screenshot);
    writeFileSync(join(SCREENSHOT_DIRECTORY, `${name}.difference.png`), PNG.sync.write(difference));
  }
  return mismatchedPixelCount;
};

describe("agentConsole", async () => {
  // The build runs inside this Vitest process, and the app's configuration answers `VITEST` with the unit-test
  // Module allowlist — no UnoCSS, no fonts. The screenshots are of the app as it ships, so the build must not see it
  vi.stubEnv("VITEST", undefined);
  await setup({
    browser: true,
    // The installed Chrome rather than a browser build downloaded for the suite
    browserOptions: { launch: { channel: "chrome" }, type: "chromium" },
    rootDir: resolve(import.meta.dirname, ".."),
    // Named rather than detected: test-utils reads the runner off `VITEST`, which the line above hides from the build
    runner: "vitest",
    // A production build of this app outlasts test-utils' own four-minute default
    setupTimeout: Temporal.Duration.from({ minutes: 20 }).total("milliseconds"),
  });

  const token = "a";
  const sessionId = crypto.randomUUID();
  const events = readRecordedEvents();
  const firstTurnResultIndex = events.findIndex(({ type }) => type === AgentEventType.TurnResult);
  // The prompt the recording was driven by, which the host reports itself rather than the SDK
  const userMessage: AgentEvent = {
    createdAt: new Date(0),
    id: crypto.randomUUID(),
    imageCount: 0,
    messageUuid: crypto.randomUUID(),
    parentToolUseId: "",
    text: "Plan two steps, then write a.txt containing a, read it back, and run `echo a` with Bash.",
    type: AgentEventType.UserMessage,
  };
  let sessions: SessionSummary[] = [];
  let callbacks: DriverCallbacks;
  let server: AgentConsoleServer;
  const openPage = async (isPaired: boolean): Promise<Page> => {
    const hostUrl = `ws://${DEFAULT_HOSTNAME}:${server.port}/?${TOKEN_QUERY_PARAMETER}=${token}`;
    const path = isPaired
      ? `${RoutePath.AgentConsole}#${PAIRING_HASH_PARAMETER}=${encodeURIComponent(hostUrl)}`
      : RoutePath.AgentConsole;
    return createPage(path, { reducedMotion: "reduce", viewport: { height: 900, width: 1440 } });
  };
  const openSession = async () => {
    const page = await openPage(true);
    await page.getByText("Write a.txt", { exact: false }).first().click();
    await page.getByText("Main agent").waitFor();
    return page;
  };

  beforeAll(async () => {
    server = await createAgentConsoleServer({
      createDriver: (driverCallbacks) => {
        callbacks = driverCallbacks;
        const noop = async () => {};
        return {
          close: noop,
          closeSession: () => {},
          createSession: async () => sessionId,
          forkSession: async () => sessionId,
          interrupt: noop,
          listSessions: async () => sessions,
          prompt: () => {},
          resolvePermission: () => {},
          resumeAt: async () => sessionId,
          resumeSession: async () => sessionId,
          runSlashCommand: () => {},
          setModel: noop,
          setPermissionMode: noop,
        };
      },
      hostname: DEFAULT_HOSTNAME,
      port: 0,
      token,
    });
  });

  afterAll(async () => {
    await server.close();
  });

  test("unpaired", async () => {
    expect.hasAssertions();

    const page = await openPage(false);
    await page.getByText("Pair with a host").waitFor();

    expect(compareWithBaseline(await page.screenshot(), "unpaired")).toBe(0);
  });

  test("connected with no session", async () => {
    expect.hasAssertions();

    const page = await openPage(true);
    await page.getByText("No session open").waitFor();

    expect(compareWithBaseline(await page.screenshot(), "connected-no-session")).toBe(0);
  });

  test("mid-turn with the tool timeline", async () => {
    expect.hasAssertions();

    sessions = [
      { cwd: "/a", id: sessionId, lastActivityAt: new Date(0), state: SessionState.Running, title: "Write a.txt" },
    ];
    callbacks.onEvents(sessionId, [userMessage, ...events.slice(0, firstTurnResultIndex)]);
    callbacks.onSessionsChange();
    const page = await openSession();

    expect(compareWithBaseline(await page.screenshot(), "mid-turn")).toBe(0);
  });

  test("a permission card", async () => {
    expect.hasAssertions();

    const permissionRequest = events.find(({ type }) => type === AgentEventType.PermissionRequest);
    callbacks.onEvents(sessionId, permissionRequest ? [permissionRequest] : []);
    const page = await openSession();
    await page.getByText("wants permission").waitFor();

    expect(compareWithBaseline(await page.screenshot(), "permission")).toBe(0);
  });

  test("a diff", async () => {
    expect.hasAssertions();

    const page = await openSession();
    await page.getByRole("tab", { name: "Changes" }).click();
    await page.getByText("/a", { exact: true }).last().click();

    expect(compareWithBaseline(await page.screenshot(), "diff")).toBe(0);
  });
});
