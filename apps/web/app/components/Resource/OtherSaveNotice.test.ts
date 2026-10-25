// @vitest-environment nuxt
import type { Device } from "#shared/models/auth/Device";

import OtherSaveNotice from "@/components/Resource/OtherSaveNotice.vue";
import { useResourceStore } from "@/store/resource";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("otherSaveNotice", () => {
  // An assistant's save is another save held behind the person's unsaved edit, so the notice offers the same choice
  // And names the agent by its key
  test("an edit arriving over an unsaved edit is offered as a choice", async () => {
    expect.hasAssertions();

    const apiKeyName = "Assistant";
    const device: Device = { sessionId: crypto.randomUUID(), userId: crypto.randomUUID() };
    const resourceStore = useResourceStore();
    resourceStore.heldSave = { apiKeyName, contentVersion: 1, device };
    const component = await mountSuspended(OtherSaveNotice);

    expect(component.text()).toContain(`Saved by the agent ${apiKeyName} while you have an unsaved edit`);
    expect(component.findAll("button").map((button) => button.text())).toStrictEqual(["Take theirs", "Keep mine"]);
  });
});
