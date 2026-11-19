// @vitest-environment nuxt
import OtherSaveNotice from "#src/components/Resource/OtherSaveNotice.vue";
import { useResourceStore } from "#src/store/resource/index";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("otherSaveNotice", () => {
  // Another writer's save is held behind the person's unsaved edit, so the notice offers the same choice
  test("an edit arriving over an unsaved edit is offered as a choice", async () => {
    expect.hasAssertions();

    const resourceStore = useResourceStore();
    resourceStore.heldSave = { contentVersion: 1 };
    const component = await mountSuspended(OtherSaveNotice);

    expect(component.text()).toContain("Saved on another device or by an agent while you have an unsaved edit");
    expect(component.findAll("button").map((button) => button.text())).toStrictEqual(["Take theirs", "Keep mine"]);
  });
});
