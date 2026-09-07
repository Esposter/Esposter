// @vitest-environment nuxt
import { waitForSynchronizedFunctions } from "#shared/util/function/getSynchronizedFunction";
import { useAlertStore } from "@/store/alert";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useQuery, () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test("populates data with the resolved result", async () => {
    expect.hasAssertions();

    const { data, refresh } = useQuery(() => Promise.resolve("result"));
    await refresh();

    expect(data.value).toBe("result");
  });

  test("reports pending for the duration of the read", async () => {
    expect.hasAssertions();

    const { promise, resolve }: PromiseWithResolvers<string> = Promise.withResolvers();
    const { data, isPending } = useQuery(() => promise);

    expect(isPending.value).toBe(true);

    resolve("result");
    await waitForSynchronizedFunctions();

    expect(isPending.value).toBe(false);
    expect(data.value).toBe("result");
  });

  test("alerts and leaves data undefined on failure", async () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { data, refresh } = useQuery(() => Promise.reject(new Error("error")));
    await refresh();

    expect(data.value).toBeUndefined();
    expect(alerts.value).toHaveLength(1);
  });
});
