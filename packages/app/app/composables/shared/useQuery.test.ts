// @vitest-environment nuxt
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

  test("alerts and leaves data undefined on failure", async () => {
    expect.hasAssertions();

    const { alerts } = storeToRefs(useAlertStore());
    const { data, refresh } = useQuery(() => Promise.reject(new Error("error")));
    await refresh();

    expect(data.value).toBeUndefined();
    expect(alerts.value).toHaveLength(1);
  });
});
