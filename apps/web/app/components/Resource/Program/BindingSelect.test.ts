// @vitest-environment nuxt
import ResourceProgramBindingSelect from "@/components/Resource/Program/BindingSelect.vue";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getMissingResourceMessage } from "@/services/resource/getMissingResourceMessage";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceProgramBindingSelect", () => {
  const label = "Email";
  const items = [{ meaning: UiIconMeaning.Email, title: "", value: crypto.randomUUID() }];

  // A deleted or binned resource drops out of the owner's list while the program still holds its id
  test("says a binding whose resource is gone can't be found", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceProgramBindingSelect, {
      props: { label, modelValue: crypto.randomUUID(), resources: { hasMore: false, items } },
    });

    expect(wrapper.find("[role='alert']").text()).toBe(getMissingResourceMessage("email"));
  });

  // Before the list is read every binding would look missing, and past the read cap the bound one may be among those
  // The read left out
  test.each([
    ["before the resources are read", undefined],
    ["past the read cap", { hasMore: true, items }],
  ])("claims nothing %s", async (_title, resources) => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceProgramBindingSelect, {
      props: { label, modelValue: crypto.randomUUID(), resources },
    });

    expect(wrapper.find("[role='alert']").exists()).toBe(false);
  });
});
