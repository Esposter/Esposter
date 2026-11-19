// @vitest-environment nuxt
import { useFluidSimulator } from "#src/composables/visual/useFluidSimulator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { defineComponent, h } from "vue";

const doubles = vi.hoisted(() => ({
  initError: new Error("the device was refused"),
  inspectorDispose: vi.fn<() => void>(),
}));

// The renderer's GPU device is refused, so its init rejects: everything built before that await is left for the unmount
vi.mock("three/webgpu", async (importOriginal) => {
  const actual = await importOriginal();
  class RefusedRenderer {
    domElement = document.createElement("canvas");
    toneMapping = 0;
    toneMappingExposure = 1;
    init() {
      return Promise.reject(doubles.initError);
    }

    setPixelRatio() {}

    setSize() {}
  }
  return { ...actual, WebGPURenderer: RefusedRenderer };
});
vi.mock("three/examples/jsm/inspector/Inspector.js", () => {
  class DisposableInspector {
    dispose() {
      doubles.inspectorDispose();
    }
  }
  return { Inspector: DisposableInspector };
});

describe(useFluidSimulator, () => {
  test("a rejected init releases the canvas and the inspector at unmount", async () => {
    expect.hasAssertions();

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

    expect(await isInitFailureReported.promise).toBe(doubles.initError);
    expect(container.children).toHaveLength(1);

    component.unmount();
    await flushPromises();

    expect(container.children).toHaveLength(0);
    expect(doubles.inspectorDispose).toHaveBeenCalledExactlyOnceWith();
  });
});
