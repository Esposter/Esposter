<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useLayoutStore } from "@/store/layout";
import { usePinStore } from "@/store/message/pin";

const layoutStore = useLayoutStore();
const { isRightDrawerOpen } = storeToRefs(layoutStore);
const { readMorePinnedMessages, readPinnedMessages } = useReadPinnedMessages();
const { isPending, refresh } = await readPinnedMessages();
const pinStore = usePinStore();
const { displayMessages, hasMore, isLoaded } = storeToRefs(pinStore);
</script>

<!-- A pane of the side panel rather than a popover off the header, as Slack's pins are: the list gets the panel's
     height, a phone reads it as the same sheet as the members, and the header keeps one button fewer -->
<template>
  <MessageRightSideBarHeader title="Pinned Messages" @close="isRightDrawerOpen = false" />
  <div px-2 flex-1 of-y-auto>
    <template v-if="isPending">
      <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
    </template>
    <UiErrorState v-else-if="!isLoaded" error="The pinned messages could not be loaded." @retry="refresh()" />
    <MessageModelMessageSearchList v-else :messages="displayMessages">
      <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMorePinnedMessages(onComplete)" />
      <template #no-data>
        <UiEmptyState
          description="Pin a message from its actions to keep it here."
          :meaning="UiIconMeaning.Pin"
          title="No pinned messages yet"
        />
      </template>
    </MessageModelMessageSearchList>
  </div>
</template>
