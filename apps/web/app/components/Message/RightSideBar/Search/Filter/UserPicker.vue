<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";
import type { SerializableValue } from "@esposter/azure";

import { useRoomStore } from "@/store/message/room";
import { useMemberStore } from "@/store/message/user/member";

const emit = defineEmits<{ select: [value: SerializableValue] }>();
const { readMembers, readMoreMembers } = useReadMembers();
const { isPending } = await readMembers();
const memberStore = useMemberStore();
const { hasMore, members } = storeToRefs(memberStore);
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
// A pick filters by the member, so a row is only a choice here, never the member list's row with its profile
const items = computed(() =>
  members.value.map<UiListItem<string>>(({ id, image, name }) => ({ image: image ?? "", title: name, value: id })),
);
</script>

<template>
  <MessageRightSideBarSearchFilterPickerList
    :has-more="Boolean(currentRoom) && hasMore"
    :is-pending
    @read-more="(onComplete) => readMoreMembers(onComplete)"
  >
    <UiList v-if="currentRoom" :items label="Members" @select="emit('select', $event)" />
  </MessageRightSideBarSearchFilterPickerList>
</template>
