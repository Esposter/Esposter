// @vitest-environment nuxt
import type { useDesmos } from "@/composables/desmos/useDesmos";
import type { Expression } from "@/models/desmos/Expression";

import VisualDesmosDisplayGraph from "@/components/Visual/Desmos/DisplayGraph.vue";
import { Colors } from "@/models/desmos/Colors";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

// The script never loads here, so its load slot calls back at once with a calculator constructor the test controls
const { GraphingCalculator } = vi.hoisted(() => ({
  GraphingCalculator: vi.fn<(element: HTMLElement, options: object) => Promise<unknown>>(),
}));
vi.mock(import("@/composables/desmos/useDesmos"), () => ({
  useDesmos: (() => ({
    onLoaded: (callback: (desmos: unknown) => void) => {
      callback({ GraphingCalculator });
    },
    status: "success",
  })) as unknown as typeof useDesmos,
}));

const mountGraph = (expressions: Expression[]) =>
  mountSuspended(VisualDesmosDisplayGraph, { attachTo: document.body, props: { expressions, id: "graph" } });

describe("displayGraph", () => {
  // The expression sets are module constants shared by every mount, so the defaults go on copies
  test("the calculator draws each expression in its default colour and leaves the expressions it was given as they were", async () => {
    expect.hasAssertions();

    const calculator = { setExpressions: vi.fn<(expressions: Expression[]) => void>() };
    GraphingCalculator.mockResolvedValueOnce(calculator);
    const expressions: Expression[] = [{ latex: "y=x" }];
    const component = await mountGraph(expressions);
    await flushPromises();

    expect(calculator.setExpressions).toHaveBeenCalledExactlyOnceWith([{ color: Colors.Black, latex: "y=x" }]);
    expect(expressions).toStrictEqual([{ latex: "y=x" }]);
    component.unmount();
  });

  test("a calculator that fails to build says so in place of the drawing", async () => {
    expect.hasAssertions();

    const error = new Error("a");
    GraphingCalculator.mockRejectedValueOnce(error);
    const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
    const component = await mountGraph([{ latex: "y=x" }]);
    await flushPromises();

    expect(component.text()).toContain("The drawing could not be loaded.");
    expect(consoleError).toHaveBeenCalledExactlyOnceWith(error);
    component.unmount();
  });
});
