<script setup lang="ts">
import type { User } from "@esposter/db-schema";

interface ProfileCardHeaderProps {
  isSelf: boolean;
  user: Pick<User, "id" | "image" | "name">;
}

defineSlots<{ actions: () => VNode }>();
const { isSelf, user } = defineProps<ProfileCardHeaderProps>();
</script>

<template>
  <div class="bg-background" relative h-20>
    <div v-if="!isSelf" absolute top-0 right-0 pt-2 pr-2 flex gap-x-2>
      <slot name="actions" />
    </div>
  </div>
  <div px-4 mt--8 flex items-end justify-between>
    <MessageModelMemberStatusAvatar :id="user.id" :image="user.image" :name="user.name" :avatar-props="{ size: 64 }" />
  </div>
</template>
