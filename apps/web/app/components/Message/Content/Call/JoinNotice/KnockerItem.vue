<script setup lang="ts">
import type { CallParticipant } from "@esposter/db-schema";

import { useCallStore } from "#src/store/message/room/call/index";
import { useUserStore } from "#src/store/message/user/index";

interface Props {
  knocker: CallParticipant;
}

defineProps<Props>();
const callStore = useCallStore();
const { callRoomId } = storeToRefs(callStore);
const userStore = useUserStore();
const { getRoomMemberName } = userStore;
</script>

<template>
  <div ui-row>
    <UiItemContent
      :image="knocker.image ?? undefined"
      :title="`${getRoomMemberName(callRoomId, knocker.userId, knocker.name)} wants to join`"
    >
      <template #append>
        <MessageContentCallJoinNoticeKnockerAdmitButton :knocker />
        <MessageContentCallJoinNoticeKnockerDismissButton :knocker />
      </template>
    </UiItemContent>
  </div>
</template>
