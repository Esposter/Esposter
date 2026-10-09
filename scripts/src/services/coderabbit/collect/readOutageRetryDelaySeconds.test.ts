import type { spawnSync as baseSpawnSync } from "node:child_process";

import { OUTAGE_RETRY_DELAY_SECONDS, RETRIGGER_BUFFER_MS } from "#src/services/coderabbit/collect/constants";
import { getRetriggerDelaySeconds } from "#src/services/coderabbit/collect/getRetriggerDelaySeconds";
import { readOutageRetryDelaySeconds } from "#src/services/coderabbit/collect/readOutageRetryDelaySeconds";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

const { spawnSync } = vi.hoisted(() => ({ spawnSync: vi.fn<typeof baseSpawnSync>() }));

vi.mock(import("node:child_process"), () => ({ spawnSync: spawnSync as unknown as typeof baseSpawnSync }));

// `gh api --include rate_limit` as it prints a response: the status line, the headers, a blank line, the body
const answerProbe = (headers: string[], body: unknown): void => {
  spawnSync.mockReturnValue({
    output: [],
    pid: 0,
    signal: null,
    status: 0,
    stderr: "",
    stdout: [...headers, "", JSON.stringify(body)].join("\r\n"),
  });
};

describe(readOutageRetryDelaySeconds, () => {
  const rateLimitMessage = "GraphQL: API rate limit exceeded for user ID 1.";
  const resetAfterMs = Temporal.Duration.from({ minutes: 10 }).total("milliseconds");
  const resetAtSeconds = Temporal.Duration.from({ milliseconds: resetAfterMs }).total("seconds");

  beforeEach(() => {
    vi.useFakeTimers({ now: 0, toFake: ["Date"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("waits the outage's five minutes on a server error, asking GitHub nothing", () => {
    expect.hasAssertions();

    expect(readOutageRetryDelaySeconds("HTTP 502: Bad Gateway (https://api.github.com/graphql)")).toBe(
      OUTAGE_RETRY_DELAY_SECONDS,
    );
    expect(spawnSync).not.toHaveBeenCalled();
  });

  test.each([
    [
      "the Retry-After a secondary limit refuses the probe with",
      ["HTTP/2.0 403 Forbidden", `Retry-After: ${resetAtSeconds}`],
      { message: "You have exceeded a secondary rate limit. Please wait a few minutes before you try again." },
      getRetriggerDelaySeconds(resetAfterMs + RETRIGGER_BUFFER_MS),
    ],
    [
      "the reset of the quota the limit left with nothing",
      ["HTTP/2.0 200 OK"],
      {
        resources: {
          core: { remaining: 1, reset: resetAtSeconds * 2 },
          graphql: { remaining: 0, reset: resetAtSeconds },
        },
      },
      getRetriggerDelaySeconds(resetAfterMs + RETRIGGER_BUFFER_MS),
    ],
    [
      "the outage's five minutes when the probe states no wait",
      ["HTTP/2.0 200 OK"],
      { resources: { graphql: { remaining: 1, reset: resetAtSeconds } } },
      OUTAGE_RETRY_DELAY_SECONDS,
    ],
  ])("waits %s on a rate limit", (_title, headers, body, expectedDelaySeconds) => {
    expect.hasAssertions();

    answerProbe(headers, body);

    expect(readOutageRetryDelaySeconds(rateLimitMessage)).toBe(expectedDelaySeconds);
  });
});
