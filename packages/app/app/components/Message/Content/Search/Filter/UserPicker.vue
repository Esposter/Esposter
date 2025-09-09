<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useMemberStore } from "@/store/message/member";

const emit = defineEmits<{ select: [value: string] }>();
const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const { isPending, readMoreMembers } = await useReadMembers();
</script>

<template>
  <v-list overflow-y-auto="!">
    <v-hover v-for="member in members" :key="member.id" #default="{ isHovering, props }">
      <MessageModelMemberListItem :key="member.id" :="props" :member @click="emit('select', member.name)">
        <template #append>
          <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
        </template>
      </MessageModelMemberListItem>
    </v-hover>
    <template v-if="isPending">
      <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <StyledWaypoint v-else :active="hasMore" @change="readMoreMembers">
      <MessageModelMemberSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </StyledWaypoint>
  </v-list>
</template>
