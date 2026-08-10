<script setup lang="ts">
import type { SerializableValue } from "@esposter/db-schema";

import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { useRoomStore } from "@/store/message/room";
import { useMemberStore } from "@/store/message/user/member";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const { readMembers, readMoreMembers } = useReadMembers();
const { isPending } = await readMembers();
const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
</script>

<template>
  <MessageRightSideBarSearchFilterPickerList
    :has-more="Boolean(currentRoom) && hasMore"
    :is-pending
    @read-more="readMoreMembers"
  >
    <template #skeleton>
      <StyledSkeletonListItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <template v-if="currentRoom">
      <MessageModelMemberListItem
        v-for="member of members"
        :key="member.id"
        :member
        :room="currentRoom"
        @click="emit('select', member.id)"
      >
        <template #append="{ hoverProps: { isHovering } }">
          <v-icon :op="isHovering ? undefined : '0!'" icon="mdi-plus" />
        </template>
      </MessageModelMemberListItem>
    </template>
  </MessageRightSideBarSearchFilterPickerList>
</template>
