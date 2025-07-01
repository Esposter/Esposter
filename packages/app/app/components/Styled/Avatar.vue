<script setup lang="ts">
import type { Session } from "@/models/auth/Session";
import type { VAvatar } from "vuetify/components";
// @TODO: https://github.com/vuejs/core/issues/11371
interface StyledAvatarProps {
  avatarProps?: VAvatar["$props"];
  image: Session["user"]["image"];
  name: Session["user"]["name"];
}

const { avatarProps, image, name } = defineProps<StyledAvatarProps>();
</script>

<template>
  <v-avatar v-if="image" :="avatarProps">
    <v-img :src="image" :alt="name" />
  </v-avatar>
  <StyledDefaultAvatar v-else :name :="avatarProps" />
</template>
