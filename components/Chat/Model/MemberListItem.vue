<script setup lang="ts">
import type { User } from "@prisma/client";

interface MemberListItemProps {
  member: User;
}

const props = defineProps<MemberListItemProps>();
const { member } = toRefs(props);
</script>

<template>
  <v-list-item :title="member.username" :value="member.username">
    <template #prepend>
      <v-badge m="r-4" color="green" location="bottom end" dot>
        <v-avatar v-if="member.avatar">
          <v-img :src="member.avatar" :alt="member.username" />
        </v-avatar>
        <DefaultAvatar v-else :name="member.username" />
      </v-badge>
    </template>
  </v-list-item>
</template>
