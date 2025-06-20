<script setup lang="ts">
import type { User } from "#shared/db/schema/users";
import type { VAvatar } from "vuetify/components/VAvatar";

import { UserStatus } from "#shared/models/db/user/UserStatus";
import { StatusBadgePropsMap } from "@/services/esbabbler/StatusBadgePropsMap";
import { useUserStatusStore } from "@/store/esbabbler/userStatus";
// @TODO: https://github.com/vuejs/core/issues/11371
interface StatusAvatarProps {
  avatarProps?: VAvatar["$props"];
  id: User["id"];
  image: User["image"];
  name: User["name"];
}

const { avatarProps, id, image, name } = defineProps<StatusAvatarProps>();
const userStatusStore = useUserStatusStore();
const { userStatusMap } = storeToRefs(userStatusStore);
const badgeProps = computed(() => {
  const userStatus = userStatusMap.value.get(id);
  return StatusBadgePropsMap[userStatus?.status ?? UserStatus.Online];
});
</script>

<template>
  <v-badge location="bottom end" dot :="badgeProps">
    <StyledAvatar :image :name :="avatarProps" />
  </v-badge>
</template>
