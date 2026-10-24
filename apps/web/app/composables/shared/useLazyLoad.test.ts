// @vitest-environment nuxt
import { takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

const mountLazyLoad = async (load: (signal: AbortSignal) => Promise<string>) => {
  const lazyLoads: ReturnType<typeof useLazyLoad<string>>[] = [];
  const wrapper = await mountSuspended(
    defineComponent({
      render: () => h("div"),
      setup: () => {
        lazyLoads.push(useLazyLoad(load));
      },
    }),
  );
  return { lazyLoads, wrapper };
};

describe(useLazyLoad, () => {
  test("a load that settles while its component is mounted is kept", async () => {
    expect.hasAssertions();

    const { lazyLoads } = await mountLazyLoad(() => Promise.resolve(""));
    await flushPromises();

    expect(takeOne(lazyLoads, 0).loaded.value).toBe("");
  });

  test("a load that settles after its component unmounts is cancelled and its value dropped", async () => {
    expect.hasAssertions();

    const { promise, resolve } = Promise.withResolvers<string>();
    const signals: AbortSignal[] = [];
    const { lazyLoads, wrapper } = await mountLazyLoad((signal) => {
      signals.push(signal);
      return promise;
    });
    wrapper.unmount();
    resolve("");
    await flushPromises();

    expect(signals.map(({ aborted }) => aborted)).toStrictEqual([true]);
    expect(takeOne(lazyLoads, 0).loaded.value).toBeUndefined();
  });
});
