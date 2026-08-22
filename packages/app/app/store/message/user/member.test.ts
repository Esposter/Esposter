// @vitest-environment nuxt
import { createRoomRole } from "@/services/message/member/createRoomRole.test";
import { setCurrentRoomId } from "@/services/message/room/setCurrentRoomId.test";
import { createUser } from "@/services/message/user/createUser.test";
import { useRoleStore } from "@/store/message/room/role";
import { useMemberStore } from "@/store/message/user/member";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

describe(useMemberStore, () => {
  const roomId = crypto.randomUUID();
  const otherRoomId = crypto.randomUUID();
  const member = createUser();
  const role = createRoomRole({ roomId });

  beforeEach(() => {
    setActivePinia(createPinia());
    setCurrentRoomId(roomId);
  });

  test("deletes a roled member out of their role group", () => {
    expect.hasAssertions();

    const roleStore = useRoleStore();
    const { setMemberRoles } = roleStore;
    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeDeleteMember } = memberStore;
    const { count, countsByTopRole } = storeToRefs(memberStore);
    // The member list headers derive the roleless group as count - sum(role groups), so a departure that
    // Drops only the total leaves the leaver in their role group and takes the remainder negative
    setMemberRoles(roomId, member.id, [role]);
    getMemberCountsRef(roomId).value.count = 1;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 1, roleId: role.id }];
    storeDeleteMember(roomId, member.id);

    expect(count.value).toBe(0);
    expect(countsByTopRole.value).toStrictEqual([{ count: 0, roleId: role.id }]);
  });

  // The leave subscription spans every room the user is in, so the event names the room it happened in. Applied
  // To the open one instead, a departure from anywhere removes a member who is still there
  test("leaves the open room alone when a member leaves another room", () => {
    expect.hasAssertions();

    const roleStore = useRoleStore();
    const { setMemberRoles } = roleStore;
    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeCreateMember, storeDeleteMember } = memberStore;
    const { count, countsByTopRole, members } = storeToRefs(memberStore);
    setMemberRoles(roomId, member.id, [role]);
    storeCreateMember(roomId, member);
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 1, roleId: role.id }];
    storeDeleteMember(otherRoomId, member.id);

    expect(members.value).toStrictEqual([member]);
    expect(count.value).toBe(1);
    expect(countsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });

  test("leaves the open room alone when a member joins another room", () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { storeCreateMember } = memberStore;
    const { count, members } = storeToRefs(memberStore);
    storeCreateMember(otherRoomId, member);

    expect(members.value).toStrictEqual([]);
    expect(count.value).toBe(0);
  });

  // The offline cache decides whether to hydrate or persist by asking whether the loaded rows are the current
  // Room's. A list shared across rooms cannot answer that, and every guard built on top of one is a guess
  test("scopes the member list to the current room", () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { storeCreateMember } = memberStore;
    const { members } = storeToRefs(memberStore);
    storeCreateMember(roomId, member);

    expect(members.value).toStrictEqual([member]);

    setCurrentRoomId(crypto.randomUUID());

    expect(members.value).toStrictEqual([]);
  });

  test("deletes a roleless member without touching the role groups", () => {
    expect.hasAssertions();

    const memberStore = useMemberStore();
    const { getMemberCountsRef, storeDeleteMember } = memberStore;
    const { count, countsByTopRole } = storeToRefs(memberStore);
    getMemberCountsRef(roomId).value.count = 2;
    getMemberCountsRef(roomId).value.countsByTopRole = [{ count: 1, roleId: role.id }];
    storeDeleteMember(roomId, member.id);

    expect(count.value).toBe(1);
    expect(countsByTopRole.value).toStrictEqual([{ count: 1, roleId: role.id }]);
  });
});
