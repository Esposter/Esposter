// @vitest-environment happy-dom
import { WebpageNodeType } from "#shared/models/pageBuilder/WebpageNodeType";
import { TEST_ID, TEST_LABEL } from "#shared/services/pageBuilder/constants.test";
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

  test("A type's output matches for every edge value", () => {
    expect.hasAssertions();

    // The texts are written as a JSON attribute, so a quote in one is escaped twice: once as JSON and once as the attribute
    expect([
      serializeHtml([
        typedTextNodeType.render({ props: { id: TEST_ID, texts: [TEST_LABEL] }, type: WebpageNodeType.TypedText }),
      ]),
      serializeHtml([
        typedTextNodeType.render({
          props: { id: TEST_ID, texts: [TEST_LABEL, TEST_ID] },
          type: WebpageNodeType.TypedText,
        }),
      ]),
      serializeHtml([
        typedTextNodeType.render({ props: { id: TEST_ID, texts: ['"&'] }, type: WebpageNodeType.TypedText }),
      ]),
    ]).toStrictEqual([
      `<span aria-label="${TEST_LABEL}" class="typed-text"><span aria-hidden="true" data-texts="[&quot;${TEST_LABEL}&quot;]">${TEST_LABEL}</span></span>`,
      `<span aria-label="${TEST_LABEL}, ${TEST_ID}" class="typed-text"><span aria-hidden="true" data-texts="[&quot;${TEST_LABEL}&quot;,&quot;${TEST_ID}&quot;]">${TEST_LABEL}</span></span>`,
      '<span aria-label="&quot;&amp;" class="typed-text"><span aria-hidden="true" data-texts="[&quot;\\&quot;&amp;&quot;]">"&amp;</span></span>',
    ]);
  });
});
