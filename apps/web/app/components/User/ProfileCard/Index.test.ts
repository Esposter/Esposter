// @vitest-environment nuxt
import UserProfileCard from "#src/components/User/ProfileCard/Index.vue";
import { updateUser, useSession } from "#src/services/auth/authClient.test";
import { waitForSynchronizedFunctions } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("userProfileCard", () => {
  // The form stays open on its edits until the server keeps the save, so a reader sees what they sent only once it is
  // Kept, and a refused save leaves the form open on the edits it could not persist
  test("a save keeps the form open on its edits until the server answers, and a refused save leaves them there", async () => {
    expect.hasAssertions();

    const { promise: heldUpdate, resolve: releaseUpdate } = Promise.withResolvers<void>();
    const { promise: updateReceived, resolve: onUpdateReceived } = Promise.withResolvers<void>();
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
    await updateReceived;
    await flushPromises();

    expect(wrapper.get("input").element.value).toBe("b");

    releaseUpdate();
    await waitForSynchronizedFunctions();
    await flushPromises();

    expect(wrapper.get("input").element.value).toBe("b");
  });
});
