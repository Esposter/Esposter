import type { DeleteMemberInput } from "#shared/models/db/room/DeleteMemberInput";
import type { User } from "@esposter/db-schema";

import { EN_US_COMPARATOR } from "@/services/shared/constants";
import { createOperationData } from "@/services/shared/createOperationData";

export const useMemberStore = defineStore("message/user/member", () => {
  const { $trpc } = useNuxtApp();
  const { items, ...restData } = useCursorPaginationData<User>();
  const members = computed(() => items.value.toSorted((a, b) => EN_US_COMPARATOR.compare(a.name, b.name)));
  const memberMap = ref(new Map<string, User>());
  const count = ref(0);

  const {
    createMember: baseStoreCreateMember,
    deleteMember: baseStoreDeleteMember,
    ...restOperationData
  } = createOperationData(
    computed({
      get: () => members.value,
      set: (newMembers) => {
        items.value = newMembers;
        for (const member of newMembers) memberMap.value.set(member.id, member);
      },
    }),
    ["id"],
    "Member",
  );
  const storeCreateMember = (member: User) => {
    baseStoreCreateMember(member);
    memberMap.value.set(member.id, member);
    count.value++;
  };
  const storeDeleteMember = (id: User["id"]) => {
    baseStoreDeleteMember({ id });
    memberMap.value.delete(id);
    count.value--;
  };
  const deleteMember = async (input: DeleteMemberInput) => {
    await $trpc.room.deleteMember.mutate(input);
    storeDeleteMember(input.userId);
  };

  return {
    count,
    memberMap,
    members,
    ...restData,
    deleteMember,
    storeCreateMember,
    storeDeleteMember,
    ...restOperationData,
  };
});
