// @vitest-environment nuxt
import ResourceLinkSelect from "@/components/Resource/Link/Select.vue";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getMissingResourceMessage } from "@/services/resource/getMissingResourceMessage";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";

describe("resourceLinkSelect", () => {
  const label = "Email";
  const items = [{ meaning: UiIconMeaning.Email, title: "", value: v7() }];

  // A deleted or binned resource drops out of the owner's list while the program still holds its id
  test("says a binding whose resource is gone can't be found", async () => {
    expect.hasAssertions();

    const wrapper = await mountSuspended(ResourceLinkSelect, {
      props: { label, modelValue: v7(), resources: { hasMore: false, items } },
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

    const wrapper = await mountSuspended(ResourceLinkSelect, { props: { label, modelValue: v7(), resources } });

    expect(wrapper.find("[role='alert']").exists()).toBe(false);
  });
});
