<script setup lang="ts">
import type { SerializableValue } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useMemberStore } from "@/store/message/user/member";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const { readMembers, readMoreMembers } = useReadMembers();
const { isPending } = await readMembers();
const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
</script>

<template>
  <v-list density="compact" py-0 overflow-y-auto="!">
    <template v-if="isPending">
      <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-else>
      <v-hover v-for="member in members" :key="member.id" #default="{ isHovering, props }">
        <MessageModelMemberListItem :key="member.id" :="props" :member @click="emit('select', member.id)">
          <template #append>
            <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
          </template>
        </MessageModelMemberListItem>
      </v-hover>
      <StyledWaypoint :is-active="hasMore" @change="readMoreMembers">
        <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </StyledWaypoint>
    </template>
  </v-list>
</template>
