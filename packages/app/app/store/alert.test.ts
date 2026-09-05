// @vitest-environment nuxt
import { useAlertStore } from "@/store/alert";
import { takeOne } from "@esposter/shared";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useAlertStore, () => {
  const text = "a";
  const otherText = "b";

  beforeEach(() => {
    setActivePinia(createPinia());
  });

  // One rejection cause reaches the store once per operation it rejected, so a second copy of an alert already
  // On screen is a toast that says nothing the first one did
  test("refreshes an identical alert instead of stacking a second copy", () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { createAlert } = alertStore;
    createAlert(text, "error");
    createAlert(text, "error");

    expect(alerts.value).toHaveLength(1);
  });

  test("keeps alerts that differ in text or severity apart", () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { createAlert } = alertStore;
    createAlert(text, "error");
    createAlert(otherText, "error");
    createAlert(text, "success");

    expect(alerts.value).toHaveLength(3);
  });

  test("stacks an identical alert again once the first was dismissed", () => {
    expect.hasAssertions();

    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    const { createAlert, deleteAlert } = alertStore;
    createAlert(text, "error");
    deleteAlert(takeOne(alerts.value).id);
    createAlert(text, "error");

    expect(alerts.value).toHaveLength(1);
  });
});
