// @vitest-environment nuxt
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
    const resourceStore = useResourceStore();
    resourceStore.heldSave = { apiKeyName, contentVersion: 1 };
    const component = await mountSuspended(OtherSaveNotice);

    expect(component.text()).toContain(`Saved by the agent ${apiKeyName} while you have an unsaved edit`);
    expect(component.findAll("button").map((button) => button.text())).toStrictEqual(["Take theirs", "Keep mine"]);
  });
});
