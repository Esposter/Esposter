import type { SharedBrowser } from "#src/models/genshinParity/shared/SharedBrowser";

import { connectSharedBrowser } from "#src/services/genshinParity/shared/connectSharedBrowser";
import { SHARED_BROWSER_CONNECT_TIMEOUT_MS } from "#src/services/genshinParity/shared/constants";
import { beforeEach, describe, expect, test, vi } from "vitest";

const { connect } = vi.hoisted(() => ({ connect: vi.fn<(wsEndpoint: string, options: object) => Promise<object>>() }));

vi.mock(import("playwright"), () => ({ chromium: { connect } }) as never);

describe(connectSharedBrowser, () => {
  const SHARED_BROWSER: SharedBrowser = { processId: 4242, wsEndpoint: "ws://127.0.0.1:9000/abc" };

  beforeEach(() => {
    vi.spyOn(console, "warn").mockReturnValue(undefined);
  });

  test("connects to the shared browser at its endpoint", async () => {
    expect.hasAssertions();
    const browser = {};
    connect.mockResolvedValueOnce(browser);
    await expect(connectSharedBrowser(SHARED_BROWSER)).resolves.toBe(browser);
    expect(connect).toHaveBeenCalledWith(SHARED_BROWSER.wsEndpoint, { timeout: SHARED_BROWSER_CONNECT_TIMEOUT_MS });
  });

  test("launches its own browser when none was started", async () => {
    expect.hasAssertions();
    await expect(connectSharedBrowser(undefined)).resolves.toBeUndefined();
    expect(connect).not.toHaveBeenCalled();
  });

  test("launches its own browser when the shared one no longer answers", async () => {
    expect.hasAssertions();
    connect.mockRejectedValueOnce(new Error("connect ECONNREFUSED"));
    await expect(connectSharedBrowser(SHARED_BROWSER)).resolves.toBeUndefined();
  });
});
