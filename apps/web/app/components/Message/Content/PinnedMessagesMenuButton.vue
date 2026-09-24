<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { usePinStore } from "@/store/message/pin";

const { readMorePinnedMessages, readPinnedMessages } = useReadPinnedMessages();
const { isPending, refresh } = await readPinnedMessages();
const pinStore = usePinStore();
const { displayMessages, hasMore, isLoaded } = storeToRefs(pinStore);
</script>

<template>
  <UiPopover label="Pinned Messages" :variant="UiButtonVariant.Quiet" px-0>
    <template #trigger>
      <UiIcon :meaning="UiIconMeaning.Pin" />
    </template>
    <div w="[min(30rem,80dvw)]" flex flex-col gap-2>
      <h2 ui-heading>Pinned messages</h2>
      <template v-if="isPending">
        <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </template>
      <UiErrorState v-else-if="!isLoaded" error="The pinned messages could not be loaded." @retry="refresh()" />
      <MessageModelMessageSearchList v-else :messages="displayMessages">
        <UiButton v-if="hasMore" :variant="UiButtonVariant.Quiet" w-full @click="readMorePinnedMessages()">
          Load more
        </UiButton>
        <template #no-data>
          <UiEmptyState
            description="Pin a message from its actions to keep it here."
            :meaning="UiIconMeaning.Bookmark"
            title="No pinned messages yet"
          />
        </template>
      </MessageModelMessageSearchList>
    </div>
  </UiPopover>
</template>
