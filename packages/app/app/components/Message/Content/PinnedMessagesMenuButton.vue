<script setup lang="ts">
import { DEFAULT_READ_LIMIT } from "#shared/services/pagination/constants";
import { usePinStore } from "@/store/message/pin";
import { mergeProps } from "vue";

const { readMorePinnedMessages, readPinnedMessages } = useReadPinnedMessages();
const { isPending } = await readPinnedMessages();
const pinStore = usePinStore();
const { hasMore, messages } = storeToRefs(pinStore);
</script>

<template>
  <v-menu location="bottom" :close-on-content-click="false">
    <template #activator="{ props: menuProps }">
      <v-tooltip location="bottom" text="Pinned Messages">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon="mdi-pin" size="small" :="mergeProps(menuProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <StyledCard flex flex-col>
      <v-card-title>
        <v-icon icon="mdi-pin" />
        Pinned messages
      </v-card-title>
      <v-divider />
      <template v-if="isPending">
        <MessageModelMessageListSkeletonItem v-for="i in DEFAULT_READ_LIMIT" :key="i" />
      </template>
      <MessageModelMessageSearchList v-else :messages>
        <div v-if="hasMore" flex justify-center>
          <v-btn variant="text" density="comfortable" @click="readMorePinnedMessages">Load more</v-btn>
        </div>
        <template #no-data>
          <v-container text-center>This room doesn't have any pinned messages... yet.</v-container>
        </template>
      </MessageModelMessageSearchList>
    </StyledCard>
  </v-menu>
</template>
