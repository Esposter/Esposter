// @vitest-environment happy-dom
import { createPanzoomContext } from "#src/services/panzoom/createPanzoomContext.test";
import { restorePanzoomStyles } from "#src/services/panzoom/restorePanzoomStyles";
import { writePanzoomStyle } from "#src/services/panzoom/writePanzoomStyle";
import { describe, expect, test } from "vitest";

describe(restorePanzoomStyles, () => {
  test("only the named properties return to their values, and the others keep what was written", () => {
    expect.hasAssertions();

    const element = document.createElement("div");
    const context = createPanzoomContext(element, document.createElement("div"));
    element.style.cursor = "crosshair";
    writePanzoomStyle(context, element, "cursor", "grab");
    writePanzoomStyle(context, element, "transform", "scale(2)");

    restorePanzoomStyles(context, ["cursor"]);

    expect(element.style.cursor).toBe("crosshair");
    expect(element.style.transform).toBe("scale(2)");
  });

  test("a property that held no value is removed, so it reads as unset again", () => {
    expect.hasAssertions();

    const element = document.createElement("div");
    const context = createPanzoomContext(element, document.createElement("div"));
    writePanzoomStyle(context, element, "user-select", "none");

    restorePanzoomStyles(context);

    expect(element.style.getPropertyValue("user-select")).toBe("");
  });
});
