// @vitest-environment nuxt
import UserProfileHeader from "@/components/User/Profile/Header.vue";
import { useSession } from "@/services/auth/authClient.test";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe("userProfileHeader", () => {
  const userId = crypto.randomUUID();
  const user = { biography: "biography", image: "", name: "name" };
  const mountHeader = (viewerId: string, profileUserId: string) => {
    useSession.mockReturnValue({ data: ref({ user: { id: viewerId } }) });
    return mountSuspended(UserProfileHeader, { props: { user, userId: profileUserId } });
  };

  // The edit entry point is the one thing on this header that is about the reader rather than about the profile,
  // So it is the one thing that must not render on someone else's
  test("offers the edit entry point on the reader's own profile", async () => {
    expect.hasAssertions();

    const component = await mountHeader(userId, userId);

    expect(component.text()).toContain("Edit profile");
  });

  test("offers no edit entry point on another user's profile", async () => {
    expect.hasAssertions();

    const component = await mountHeader(crypto.randomUUID(), userId);

    expect(component.text()).not.toContain("Edit profile");
  });
});
