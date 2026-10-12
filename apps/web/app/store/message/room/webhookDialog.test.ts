// @vitest-environment nuxt
import { WebhookDialogAction } from "@/models/message/room/WebhookDialogAction";
import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";
import { describe, expect, test } from "vitest";

describe(useWebhookDialogStore, () => {
  test("an action's selected id is its own, so a pick for one leaves the other's empty", () => {
    expect.hasAssertions();

    const store = useWebhookDialogStore();
    store.getSelectedId(WebhookDialogAction.Delete).value = "deleting";

    expect(store.getSelectedId(WebhookDialogAction.Delete).value).toBe("deleting");
    expect(store.getSelectedId(WebhookDialogAction.RotateToken).value).toBe("");
  });
});
