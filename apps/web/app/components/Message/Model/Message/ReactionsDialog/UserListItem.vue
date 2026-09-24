<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useUserStore } from "@/store/message/user";
import { useMemberStore } from "@/store/message/user/member";

interface Props {
  userId: User["id"];
}

const { userId } = defineProps<Props>();
const memberStore = useMemberStore();
const { getMemberName } = memberStore;
const userStore = useUserStore();
const { userMap } = storeToRefs(userStore);
const user = computed(() => userMap.value.get(userId));
// The room display name — a nickname where one is set, which is what the rest of the room shows this person as
const memberName = computed(() => getMemberName(userId));
</script>

<template>
  <!-- The account's own name follows only when a nickname is standing in front of it, which is Discord's rule too -->
  <div role="listitem" ui-row>
    <UiItemContent
      :description="user && user.name !== memberName ? user.name : undefined"
      :image="user?.image ?? ''"
      :title="memberName"
    />
  </div>
</template>
