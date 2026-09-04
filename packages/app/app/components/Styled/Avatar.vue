<script setup lang="ts">
import type { User } from "better-auth";
import type { VAvatar } from "vuetify/components";

import { mergeProps } from "vue";
// @TODO: https://github.com/vuejs/core/issues/11371
interface Props {
  avatarAttrs?: VAvatar["$attrs"];
  avatarProps?: VAvatar["$props"];
  image?: User["image"];
  name: User["name"];
}

const { avatarAttrs = {}, avatarProps = {}, image, name } = defineProps<Props>();
const mergedAvatarProps = computed(() => mergeProps(avatarAttrs, avatarProps));
</script>

<template>
  <v-avatar v-if="image" :="mergedAvatarProps">
    <NuxtImg size-full object-contain :src="image" :alt="name" />
  </v-avatar>
  <StyledDefaultAvatar v-else :="mergedAvatarProps" />
</template>
