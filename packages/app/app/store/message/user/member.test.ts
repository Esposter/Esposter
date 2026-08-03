// @vitest-environment nuxt
import type { RoomRoleInMessage, User } from "@esposter/db-schema";
import type { Router } from "vue-router";

import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";
import { createPinia, setActivePinia } from "pinia";
import { beforeAll, beforeEach, describe, expect, test } from "vitest";

describe(useMemberStore, () => {
  let router: Router;
  const roomId = crypto.randomUUID();
  const name = "name";
  const member: User = {
    biography: "",
    createdAt: new Date("1970-01-01"),
    deletedAt: null,
    email: "",
    emailVerified: false,
    id: crypto.randomUUID(),
    image: "",
    name,
    updatedAt: new Date("1970-01-01"),
  };
  const role: RoomRoleInMessage = {
    color: "",
    createdAt: new Date("1970-01-01"),
    deletedAt: null,
    id: crypto.randomUUID(),
    isEveryone: false,
    name,
    permissions: 0n,
    position: 0,
    roomId,
    updatedAt: new Date("1970-01-01"),
  };

  // The route is a shallowRef, so mutating a param in place is invisible to everything deriving the room from it
  const setRouteId = (id: string) => {
    router.currentRoute.value.params.id = id;
    triggerRef(router.currentRoute);
  };

  beforeAll(() => {
    router = useRouter();
  });

  beforeEach(() => {
    setActivePinia(createPinia());
    setRouteId(roomId);
  });

  test("deletes a roled member out of their role group", () => {
    expect.hasAssertions();

    const roleStore = useRoleStore();
    const { setMemberRoles } = roleStore;
    const memberStore = useMemberStore();
    const { storeDeleteMember } = memberStore;
    const { count, countsByTopRole } = storeToRefs(memberStore);
    // The member list headers derive the roleless group as count - sum(role groups), so a departure that
    // Drops only the total leaves the leaver in their role group and takes the remainder negative
    setMemberRoles(roomId, member.id, [role]);
    count.value = 1;
    countsByTopRole.value = [{ count: 1, roleId: role.id }];
    storeDeleteMember(member.id);

    expect(count.value).toBe(0);
    expect(countsByTopRole.value).toStrictEqual([{ count: 0, roleId: role.id }]);
  });

  // The offline cache decides whether to hydrate or persist by asking whether the loaded rows are the current
  // Room's. A list shared across rooms cannot answer that, and every guard built on top of one is a guess
  test("scopes the member list to the current room", () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { storeCreateMember } = memberStore;
    const { members } = storeToRefs(memberStore);
    storeCreateMember(member);

    expect(members.value).toStrictEqual([member]);

    setRouteId(crypto.randomUUID());

    expect(members.value).toStrictEqual([]);
  });

  test("deletes a roleless member without touching the role groups", () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { storeDeleteMember } = memberStore;
    const { count, countsByTopRole } = storeToRefs(memberStore);
    count.value = 2;
    countsByTopRole.value = [{ count: 1, roleId: role.id }];
    storeDeleteMember(member.id);

    expect(count.value).toBe(1);
    expect(countsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });
});
