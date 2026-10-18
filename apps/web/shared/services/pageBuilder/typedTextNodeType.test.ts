// @vitest-environment happy-dom
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID } from "#shared/services/pageBuilder/constants.test";
import { serializeHtml } from "#shared/services/pageBuilder/serializeHtml";
import { typedTextNodeType } from "#shared/services/pageBuilder/typedTextNodeType";
import { afterEach, describe, expect, test, vi } from "vitest";

describe("typedTextNodeType", () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test("typed text stands still for a reader who prefers reduced motion", () => {
    expect.hasAssertions();

    vi.useFakeTimers();
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    document.body.innerHTML = serializeHtml([
      typedTextNodeType.render({ props: { id: TEST_ID, texts: ["a", "b"] }, type: WebpageNodeType.TypedText }),
    ]);
    typedTextNodeType.script?.();

    expect({
      label: document.querySelector(".typed-text")?.getAttribute("aria-label"),
      text: document.querySelector(".typed-text")?.textContent,
      timers: vi.getTimerCount(),
    }).toStrictEqual({ label: "a, b", text: "a, b", timers: 0 });
  });
});
