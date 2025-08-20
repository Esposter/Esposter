<script setup lang="ts">
import type { Session } from "@/models/auth/Session";
import type { VAvatar } from "vuetify/components/VAvatar";

import { StatusBadgePropsMap } from "@/services/message/StatusBadgePropsMap";
import { useUserStatusStore } from "@/store/message/userStatus";
// @TODO: https://github.com/vuejs/core/issues/11371
interface StatusAvatarProps {
  avatarProps?: VAvatar["$props"];
  id: Session["user"]["id"];
  image: Session["user"]["image"];
  name: Session["user"]["name"];
}

const { avatarProps, id, image, name } = defineProps<StatusAvatarProps>();
const userStatusStore = useUserStatusStore();
const { getUserStatusEnum } = userStatusStore;
const badgeProps = computed(() => {
  const userStatusEnum = getUserStatusEnum(id);
  return StatusBadgePropsMap[userStatusEnum];
});
</script>

<template>
  <v-badge location="bottom end" dot :="badgeProps">
    <StyledAvatar :image :name :="avatarProps" />
  </v-badge>
</template>
