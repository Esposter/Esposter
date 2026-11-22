// @vitest-environment nuxt
import { WebhookDialogAction } from "#src/models/message/room/WebhookDialogAction";
import { useWebhookDialogStore } from "#src/store/message/room/webhookDialog";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe(useWebhookDialogStore, () => {
  test("an action's selected id is its own, so a pick for one leaves the other's empty", () => {
    expect.hasAssertions();

    const id = v7();
    const webhookDialogStore = useWebhookDialogStore();
    const { getSelectedId } = webhookDialogStore;
    getSelectedId(WebhookDialogAction.Delete).value = id;

    expect(getSelectedId(WebhookDialogAction.Delete).value).toBe(id);
    expect(getSelectedId(WebhookDialogAction.Regenerate).value).toBe("");
  });
});
