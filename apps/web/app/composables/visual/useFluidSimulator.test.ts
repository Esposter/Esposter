// @vitest-environment nuxt
import { useFluidSimulator } from "#src/composables/visual/useFluidSimulator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { Inspector } from "three/examples/jsm/inspector/Inspector.js";
import { WebGPURenderer } from "three/webgpu";
import { afterEach, describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";

describe(useFluidSimulator, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("a rejected init releases the canvas and the inspector at unmount", async () => {
    expect.hasAssertions();

    // The GPU device is refused, so the renderer's init rejects after everything before it has been built
    const initError = new Error("the device was refused");
    vi.spyOn(WebGPURenderer.prototype, "init").mockRejectedValue(initError);
    const inspectorDispose = vi.spyOn(Inspector.prototype, "dispose");
    const container = document.createElement("div");
    // Vue reports a rejected hook to the app's error handler, so the refusal is awaited there rather than polled for
    const isInitFailureReported = Promise.withResolvers<Error>();
    const component = await mountSuspended(
      defineComponent({
        setup() {
          useFluidSimulator(container);
          return () => h("div");
        },
      }),
      {
        global: {
          config: {
            errorHandler: (error) => {
              if (error instanceof Error) isInitFailureReported.resolve(error);
            },
          },
        },
      },
    );

    expect(await isInitFailureReported.promise).toBe(initError);
    expect(container.children).toHaveLength(1);

    component.unmount();
    await flushPromises();

    expect(container.children).toHaveLength(0);
    expect(inspectorDispose).toHaveBeenCalledExactlyOnceWith();
  });
});
