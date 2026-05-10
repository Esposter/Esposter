<script setup lang="ts">
import type { User } from "better-auth";
import type { VAvatar } from "vuetify/components";

import { mergeProps } from "vue";
// @TODO: https://github.com/vuejs/core/issues/11371
interface StyledAvatarProps {
  avatarAttrs?: VAvatar["$attrs"];
  avatarProps?: VAvatar["$props"];
  image?: User["image"];
  name: User["name"];
}

const { avatarAttrs = {}, avatarProps = {}, image, name } = defineProps<StyledAvatarProps>();
</script>

<template>
  <v-avatar v-if="image" :="mergeProps(avatarAttrs, avatarProps)">
    <v-img :src="image" :alt="name" />
  </v-avatar>
  <StyledDefaultAvatar v-else :="mergeProps(avatarAttrs, avatarProps)" />
</template>
