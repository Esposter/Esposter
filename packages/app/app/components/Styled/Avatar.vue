<script setup lang="ts">
import type { VAvatar } from "vuetify/components";

interface StyledAvatarProps {
  avatarProps?: VAvatar["$props"];
  image: null | string;
  name: string;
}

const { avatarProps, image, name } = defineProps<StyledAvatarProps>();
</script>

<template>
  <v-avatar v-if="image" :="avatarProps">
    <v-img :src="image" :alt="name" />
  </v-avatar>
  <StyledDefaultAvatar v-else :name :="avatarProps" />
</template>
