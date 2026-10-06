// @vitest-environment nuxt
import ResourceProgramBindingSelect from "@/components/Resource/Program/BindingSelect.vue";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getMissingResourceMessage } from "@/services/resource/getMissingResourceMessage";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceProgramBindingSelect", () => {
  const label = "Email";
  const resources = [{ meaning: UiIconMeaning.Email, title: "", value: crypto.randomUUID() }];

  // A deleted or binned resource drops out of the owner's list while the program still holds its id
  test("says a binding whose resource is gone can't be found", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceProgramBindingSelect, {
      props: { label, modelValue: crypto.randomUUID(), resources },
    });

    expect(wrapper.find("[role='alert']").text()).toBe(getMissingResourceMessage("email"));
  });

  // Before the list is read every binding would look missing, and so would every binding after a failed read
  test("claims nothing before the resources are read", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceProgramBindingSelect, {
      props: { label, modelValue: crypto.randomUUID() },
    });

    expect(wrapper.find("[role='alert']").exists()).toBe(false);
  });
});
