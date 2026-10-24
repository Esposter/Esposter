// @vitest-environment nuxt
import { OFFLINE_CAP_MS } from "@/services/clicker/constants";
import { useOfflineProgressStore } from "@/store/clicker/offlineProgress";
import { describe, expect, test } from "vitest";

// The dialog says production is capped only when the absence passes the cap, so the flag is the cap's edge and nothing
// Else: an absence of exactly the cap was fully paid out
describe(useOfflineProgressStore, () => {
  test("reports the cap only once the absence passes it", () => {
    expect.hasAssertions();

    const offlineProgressStore = useOfflineProgressStore();
    const { elapsedMs, isCapped } = storeToRefs(offlineProgressStore);
    elapsedMs.value = OFFLINE_CAP_MS;

    expect(isCapped.value).toBe(false);

    elapsedMs.value = OFFLINE_CAP_MS + 1;

    expect(isCapped.value).toBe(true);
  });

  test("dismisses the award and the absence together", () => {
    expect.hasAssertions();

    const offlineProgressStore = useOfflineProgressStore();
    const { awardedPoints, elapsedMs } = storeToRefs(offlineProgressStore);
    const { dismiss } = offlineProgressStore;
    awardedPoints.value = 10;
    elapsedMs.value = OFFLINE_CAP_MS;
    dismiss();

    expect(awardedPoints.value).toBe(0);
    expect(elapsedMs.value).toBe(0);
  });
});
