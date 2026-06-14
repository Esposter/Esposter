import type { User } from "@esposter/db-schema";

import { EN_US_COMPARATOR } from "@/services/shared/constants";
import { createOperationData } from "@/services/shared/createOperationData";
import { useUserStore } from "@/store/message/user";

export const useMemberStore = defineStore("message/user/member", () => {
  const userStore = useUserStore();
  const { storeUser, storeUsers } = userStore;
  const { items, ...restData } = useCursorPaginationData<User>();
  const members = computed(() => items.value.toSorted((a, b) => EN_US_COMPARATOR.compare(a.name, b.name)));
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
        storeUsers(newMembers);
      },
    }),
    ["id"],
    "Member",
  );
  const storeCreateMember = (member: User) => {
    baseStoreCreateMember(member);
    storeUser(member);
    count.value++;
  };
  const storeDeleteMember = (id: User["id"]) => {
    baseStoreDeleteMember({ id });
    count.value--;
  };
  return {
    count,
    members,
    ...restData,
    storeCreateMember,
    storeDeleteMember,
    ...restOperationData,
  };
});
