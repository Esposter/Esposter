// @vitest-environment nuxt
import { useAdminActionMap } from "#src/composables/message/moderation/useAdminActionMap";
import { useSession } from "#src/services/auth/authClient.test";
import { useAlertStore } from "#src/store/alert";
import { AdminActionType } from "@esposter/db-schema";
import { v7 } from "uuid";
import { beforeEach, describe, expect, test } from "vitest";

describe(useAdminActionMap, () => {
  const roomId = v7();
  const userId = v7();

  beforeEach(() => {
    useSession.mockImplementation((fetcher?: unknown) =>
      fetcher ? { data: ref({ user: { id: userId } }) } : ref({ data: { user: { id: userId } } }),
    );
  });

  // The alert store is the one surface App.vue actually renders — a notice sent anywhere else tells a member
  // Who was warned, kicked or timed out nothing at all
  test("alerts the member an action was taken against", async () => {
    expect.hasAssertions();

    const adminActionMap = useAdminActionMap();
    const alertStore = useAlertStore();
    const { alerts } = storeToRefs(alertStore);
    await adminActionMap[AdminActionType.Warn]?.(roomId);

    expect(alerts.value.map(({ text }) => text)).toStrictEqual(["You have been warned."]);
  });
});
