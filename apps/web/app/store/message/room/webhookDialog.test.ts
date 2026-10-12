// @vitest-environment nuxt
import { WebhookDialogAction } from "@/models/message/room/WebhookDialogAction";
import { useWebhookDialogStore } from "@/store/message/room/webhookDialog";
import { describe, expect, test } from "vitest";

describe(useWebhookDialogStore, () => {
  test("an action's selected id is its own, so a pick for one leaves the other's empty", () => {
    expect.hasAssertions();

    const webhookDialogStore = useWebhookDialogStore();
    webhookDialogStore.getSelectedId(WebhookDialogAction.Delete).value = "deleting";

    expect(webhookDialogStore.getSelectedId(WebhookDialogAction.Delete).value).toBe("deleting");
    expect(webhookDialogStore.getSelectedId(WebhookDialogAction.RotateToken).value).toBe("");
  });
});
