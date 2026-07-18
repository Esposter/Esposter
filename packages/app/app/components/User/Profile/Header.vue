<script setup lang="ts">
import type { User } from "@esposter/db-schema";

interface HeaderProps {
  user: Pick<User, "biography" | "image" | "name">;
}

const { user } = defineProps<HeaderProps>();
</script>

<template>
  <div text-center flex flex-col gap-y-3 items-center>
    <StyledAvatar :image="user.image" :name="user.name" :avatar-props="{ size: '6rem' }" />
    <div font-bold text-headline-small>{{ user.name }}</div>
    <div v-if="user.biography" op-medium-emphasis text-body-large>{{ user.biography }}</div>
  </div>
</template>
