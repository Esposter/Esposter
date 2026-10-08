import { parseSharedBrowser } from "#src/services/genshinParity/shared/parseSharedBrowser";
import { describe, expect, test } from "vitest";

describe(parseSharedBrowser, () => {
  const SHARED_BROWSER = { processId: 4242, wsEndpoint: "ws://127.0.0.1:9000/abc" };

  test("reads the endpoint and process `browser start` wrote", () => {
    expect.hasAssertions();
    expect(parseSharedBrowser(JSON.stringify(SHARED_BROWSER))).toStrictEqual(SHARED_BROWSER);
  });

  test("reads nothing from a file cut short or of another shape", () => {
    expect.hasAssertions();
    expect(parseSharedBrowser('{"processId":4242,"wsEnd')).toBeUndefined();
    expect(
      parseSharedBrowser(JSON.stringify({ processId: "4242", wsEndpoint: SHARED_BROWSER.wsEndpoint })),
    ).toBeUndefined();
    expect(parseSharedBrowser("null")).toBeUndefined();
  });
});
