<script setup lang="ts">
import type { User } from "@esposter/db-schema";

interface Props {
  displayName: string;
  isSelf: boolean;
  user: Pick<User, "id" | "image">;
}

defineSlots<{ actions: () => VNode }>();
const { displayName, isSelf, user } = defineProps<Props>();
</script>

<template>
  <div bg-background h-20 relative>
    <div v-if="!isSelf" pr-2 pt-2 flex gap-x-2 right-0 top-0 absolute>
      <slot name="actions" />
    </div>
  </div>
  <div mt--8 px-4 flex items-end justify-between>
    <MessageModelMemberStatusAvatar
      :id="user.id"
      :image="user.image"
      :name="displayName"
      :avatar-props="{ size: '4rem' }"
    />
  </div>
</template>
