<script setup lang="ts">
import { DraftsSentTab } from "@/models/message/draftsSent/DraftsSentTab";

definePageMeta({ middleware: "auth" });

const tab = ref(DraftsSentTab.Drafts);
const readDraftsSent = useReadDraftsSent();
await readDraftsSent();
</script>

<template>
  <NuxtLayout hide-global-scrollbar>
    <template #left>
      <MessageLeftSideBar />
    </template>
    <div bg-surface flex flex-col h-full min-h-0>
      <div px-6 pt-5>
        <h1 font-bold text-headline-small>Drafts & sent</h1>
        <MessageDraftsSentTabs v-model="tab" />
      </div>
      <v-divider />
      <div p-6 flex-1 min-h-0 overflow-y-auto>
        <v-window v-model="tab">
          <v-window-item :value="DraftsSentTab.Drafts">
            <MessageDraftsSentDraftList />
          </v-window-item>
          <v-window-item :value="DraftsSentTab.Scheduled">
            <MessageDraftsSentScheduledList />
          </v-window-item>
          <v-window-item :value="DraftsSentTab.Sent">
            <MessageDraftsSentList />
          </v-window-item>
        </v-window>
      </div>
      <MessageDraftsSentScheduleDialog />
    </div>
  </NuxtLayout>
</template>
