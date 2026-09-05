// @vitest-environment nuxt
import UserProfileHeader from "@/components/User/Profile/Header.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

const { useSessionMock } = vi.hoisted(() => ({ useSessionMock: vi.fn<(fetcher?: unknown) => unknown>() }));

vi.mock(import("@/services/auth/authClient"), () => ({
  authClient: { useSession: useSessionMock } as unknown as (typeof import("@/services/auth/authClient"))["authClient"],
}));

describe("userProfileHeader", () => {
  const userId = crypto.randomUUID();
  const user = { biography: "biography", image: "", name: "name" };
  const mountHeader = (viewerId: string, profileUserId: string) => {
    useSessionMock.mockReturnValue({ data: ref({ user: { id: viewerId } }) });
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
