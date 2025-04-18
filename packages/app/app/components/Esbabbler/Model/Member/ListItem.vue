<script setup lang="ts">
import type { User } from "#shared/db/schema/users";

interface MemberListItemProps {
  member: User;
}

const { member } = defineProps<MemberListItemProps>();
</script>

<template>
  <v-list-item v-if="member.name" :title="member.name" :value="member.name">
    <template #prepend>
      <v-badge mr-4 color="green" location="bottom end" dot>
        <StyledAvatar :image="member.image" :name="member.name" />
      </v-badge>
    </template>
  </v-list-item>
</template>
