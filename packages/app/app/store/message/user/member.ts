import type { User } from "@esposter/db-schema";

import { EN_US_COMPARATOR } from "@/services/shared/constants";
import { createOperationData } from "@/services/shared/createOperationData";

export const useMemberStore = defineStore("message/user/member", () => {
  const { items, ...rest } = useCursorPaginationData<User>();
  const members = computed(() => items.value.toSorted((a, b) => EN_US_COMPARATOR.compare(a.name, b.name)));
  const memberMap = ref(new Map<string, User>());
  return {
    memberMap,
    members,
    ...createOperationData(
      computed({
        get: () => members.value,
        set: (newMembers) => {
          items.value = newMembers;
          for (const member of newMembers) memberMap.value.set(member.id, member);
        },
      }),
      ["id"],
      "Member",
    ),
    ...rest,
  };
});
