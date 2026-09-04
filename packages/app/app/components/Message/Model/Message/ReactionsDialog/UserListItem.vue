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
  <v-list-item>
    <template #prepend>
      <StyledAvatar :avatar-props="{ size: 'small' }" :="{ image: user?.image }" mr-3 :name="memberName" />
    </template>
    <v-list-item-title font-bold>{{ memberName }}</v-list-item-title>
    <!-- Only worth a line when a nickname is standing in front of it, which is Discord's rule too -->
    <v-list-item-subtitle v-if="user && user.name !== memberName">{{ user.name }}</v-list-item-subtitle>
  </v-list-item>
</template>
