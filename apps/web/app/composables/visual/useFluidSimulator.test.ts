/* oxlint-disable vitest/prefer-import-in-mock -- A partial fake: the typed three.js module's WebGPURenderer is a class the fake renderer does not satisfy, so the typed factory would refuse it */
// @vitest-environment nuxt
import { useFluidSimulator } from "#src/composables/visual/useFluidSimulator";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

const doubles = vi.hoisted(() => {
  const inspectorDispose = vi.fn<() => void>();
  // A constructor that hands back its own disposer, so `new Inspector()` is the fake whose disposal the test counts
  const DisposableInspector = function () {
    return { dispose: inspectorDispose };
  };
  return { DisposableInspector, initError: new Error("the device was refused"), inspectorDispose };
});

// The renderer's GPU device is refused, so its init rejects: everything built before that await is left for the unmount
vi.mock("three/webgpu", async (importOriginal) => {
  const actual = await importOriginal<object>();
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
vi.mock("three/examples/jsm/inspector/Inspector.js", () => ({ Inspector: doubles.DisposableInspector }));

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

    await expect(isInitFailureReported.promise).resolves.toBe(doubles.initError);
    expect(container.children).toHaveLength(1);

    component.unmount();
    await flushPromises();

    expect(container.children).toHaveLength(0);
    expect(doubles.inspectorDispose).toHaveBeenCalledExactlyOnceWith();
  });
});
