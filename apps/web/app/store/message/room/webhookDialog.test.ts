// @vitest-environment nuxt
import { WebhookDialogAction } from "#src/models/message/room/WebhookDialogAction";
import { useWebhookDialogStore } from "#src/store/message/room/webhookDialog";
import { describe, expect, test } from "vitest";

describe(useWebhookDialogStore, () => {
  test("an action's selected id is its own, so a pick for one leaves the other's empty", () => {
    expect.hasAssertions();

    const webhookDialogStore = useWebhookDialogStore();
    const { getSelectedId } = webhookDialogStore;
    getSelectedId(WebhookDialogAction.Delete).value = "deleting";

    expect(getSelectedId(WebhookDialogAction.Delete).value).toBe("deleting");
    expect(getSelectedId(WebhookDialogAction.Regenerate).value).toBe("");
  });
});
