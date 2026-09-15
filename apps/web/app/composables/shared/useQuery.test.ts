// @vitest-environment nuxt
import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { useAlertStore } from "@/store/alert";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useQuery, () => {
  const result = "result";
  const rejection = new Error("error");

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("populates data with the resolved result", async () => {
    expect.hasAssertions();

    const { data, refresh } = useQuery(() => Promise.resolve(result));
    await refresh();

    expect(data.value).toBe(result);
  });

  test("reports pending for the duration of the read", async () => {
    expect.hasAssertions();

    const { promise, resolve }: PromiseWithResolvers<string> = Promise.withResolvers();
    const { data, isPending } = useQuery(() => promise);

    expect(isPending.value).toBe(true);

    resolve(result);
    await waitForSynchronizedFunctions();

    expect(isPending.value).toBe(false);
    expect(data.value).toBe(result);
  });

  test("waits for the first refresh when lazy", async () => {
    expect.hasAssertions();

    const { data, isPending, refresh } = useQuery(() => Promise.resolve(result), { isLazy: true });

    expect(isPending.value).toBe(false);
    expect(data.value).toBeUndefined();

    await refresh();

    expect(data.value).toBe(result);
  });

  test("alerts and leaves data undefined on failure", async () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { data, refresh } = useQuery(() => Promise.reject(rejection));
    await refresh();

    expect(data.value).toBeUndefined();
    expect(alerts.value).toHaveLength(1);
  });

  test("reports the failure through error instead of the toast when it is rendered inline", async () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { error, refresh } = useQuery(() => Promise.reject(rejection), { isInlineError: true });
    await refresh();

    expect(error.value).toBe(rejection.message);
    expect(alerts.value).toHaveLength(0);
  });

  test("clears a previous failure once the read lands", async () => {
    expect.hasAssertions();

    let isFailing = true;
    const { data, error, refresh } = useQuery(() => (isFailing ? Promise.reject(rejection) : Promise.resolve(result)), {
      isInlineError: true,
    });
    await waitForSynchronizedFunctions();

    expect(error.value).toBe(rejection.message);

    isFailing = false;
    await refresh();

    expect(error.value).toBe("");
    expect(data.value).toBe(result);
  });
});
