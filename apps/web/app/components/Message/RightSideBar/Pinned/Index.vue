<script setup lang="ts">
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useLayoutStore } from "#src/store/layout";
import { usePinStore } from "#src/store/message/pin";
import { DEFAULT_PAGE_LIMIT } from "@esposter/db-schema";

const layoutStore = useLayoutStore();
const { isRightDrawerOpen } = storeToRefs(layoutStore);
const { readMorePinnedMessages, readPinnedMessages } = useReadPinnedMessages();
const { isPending, refresh } = await readPinnedMessages();
const pinStore = usePinStore();
const { hasMore, isLoaded, items } = storeToRefs(pinStore);
</script>

<!-- A pane of the side panel rather than a popover off the header, as Slack's pins are: the list gets the panel's
     height, a phone reads it as the same sheet as the members, and the header keeps one button fewer -->
<template>
  <MessageRightSideBarPane title="Pinned Messages" is-body-bare @close="isRightDrawerOpen = false">
    <template v-if="isPending">
      <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_PAGE_LIMIT" :key="i" px-2 />
    </template>
    <UiErrorState v-else-if="!isLoaded" error="The pinned messages could not be loaded." @retry="refresh()" />
    <MessageModelMessageSearchList v-else :messages="items">
      <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMorePinnedMessages(onComplete)" />
      <template #no-data>
        <UiEmptyState
          description="Pin a message from its actions to keep it here."
          :meaning="UiIconMeaning.Pin"
          title="No pinned messages yet"
        />
      </template>
    </MessageModelMessageSearchList>
  </MessageRightSideBarPane>
</template>
