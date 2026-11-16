// @vitest-environment nuxt
import UserProfileCard from "#src/components/User/ProfileCard/Index.vue";
import { updateUser, useSession } from "#src/services/auth/authClient.test";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("userProfileCard", () => {
  // The form closes as the save is sent, so the reader can open it again and start another draft before the refusal of
  // The first lands. The refusal reopens the form on its own edits only while the form is still closed
  test("a refused save leaves a draft the reader has started since", async () => {
    expect.hasAssertions();

    const { promise: heldUpdate, resolve: releaseUpdate } = Promise.withResolvers<void>();
    const { promise: isUpdateReceived, resolve: onUpdateReceived } = Promise.withResolvers<void>();
    updateUser.mockImplementation(async () => {
      onUpdateReceived();
      await heldUpdate;
      return { data: null, error: { message: " ", status: 500, statusText: " " } };
    });
    useSession.mockReturnValue({ data: ref({ user: { biography: "", image: "", name: "a" } }) });
    const wrapper = await mountSuspended(UserProfileCard, { attachTo: document.body });
    await wrapper.get("button").trigger("click");
    await wrapper.get("input").setValue("b");
    await wrapper.get('button[type="submit"]').trigger("click");
    await isUpdateReceived;
    await flushPromises();
    await wrapper.get("button").trigger("click");
    await wrapper.get("input").setValue("c");
    releaseUpdate();
    await waitForSynchronizedFunctions();
    await flushPromises();

    expect(wrapper.get("input").element.value).toBe("c");
  });
});
