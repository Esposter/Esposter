// @vitest-environment happy-dom
import { createPanzoomContext } from "#src/services/panzoom/createPanzoomContext.test";
import { restorePanzoomStyles } from "#src/services/panzoom/restorePanzoomStyles";
import { writePanzoomStyle } from "#src/services/panzoom/writePanzoomStyle";
import { describe, expect, test } from "vitest";

describe(writePanzoomStyle, () => {
  test("a later write does not replace the value recorded by the first, so a restore returns the original", () => {
    expect.hasAssertions();

    const element = document.createElement("div");
    const context = createPanzoomContext(element, document.createElement("div"));
    element.style.cursor = "crosshair";

    writePanzoomStyle(context, element, "cursor", "grab");
    writePanzoomStyle(context, element, "cursor", "move");
    restorePanzoomStyles(context);

    expect(element.style.cursor).toBe("crosshair");
  });
});
