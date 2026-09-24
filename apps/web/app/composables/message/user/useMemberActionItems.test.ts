// @vitest-environment nuxt
import { useMemberActionItems } from "@/composables/message/user/useMemberActionItems";
import { useSession } from "@/services/auth/authClient.test";
import { createUser } from "@/services/message/user/createUser.test";
import { useFriendStore } from "@/store/message/user/friend";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

vi.mock(import("@/services/auth/authClient"), () => import("@/services/auth/authClient.test"));

describe(useMemberActionItems, () => {
  const userId = crypto.randomUUID();
  const member = createUser();

  beforeEach(() => {
    setActivePinia(createPinia());
    useSession.mockReturnValue(ref({ data: { user: { id: userId } } }));
  });

  // A direct message is only ever opened with a friend, so a friend's lead action is messaging them
  test("leads a friend with messaging them", () => {
    expect.hasAssertions();

    const friendStore = useFriendStore();
    const { friends } = storeToRefs(friendStore);
    friends.value = [member];
    const { friendItem } = useMemberActionItems(member, "", vi.fn<() => void>());

    expect(friendItem.value?.title).toBe("Message");
  });

  test("leads anyone else with adding them", () => {
    expect.hasAssertions();

    const { friendItem } = useMemberActionItems(member, "", vi.fn<() => void>());

    expect(friendItem.value?.title).toBe("Add friend");
  });

  // Nothing a member does to another applies to themselves, so their own row offers only what is not an act on them
  test("offers the reader no friend or moderation action on themselves", () => {
    expect.hasAssertions();

    const { friendItem, moderationItems } = useMemberActionItems(
      createUser({ id: userId }),
      crypto.randomUUID(),
      vi.fn<() => void>(),
    );

    expect(friendItem.value).toBeUndefined();
    expect(moderationItems.value).toStrictEqual([]);
  });
});
