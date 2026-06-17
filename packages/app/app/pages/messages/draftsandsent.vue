<script setup lang="ts">
import { TAB_QUERY_PARAMETER_KEY } from "#shared/services/route/constants";
import { DraftsAndSentTab, DraftsAndSentTabs } from "@/models/message/draftsAndSent/DraftsAndSentTab";

definePageMeta({ middleware: "auth" });

const tab = useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, DraftsAndSentTabs, DraftsAndSentTab.Drafts);
const readDraftsAndSent = useReadDraftsAndSent();
await readDraftsAndSent();
</script>

<template>
  <NuxtLayout hide-global-scrollbar>
    <template #left>
      <MessageLeftSideBar />
    </template>
    <div bg-surface flex flex-col h-full min-h-0>
      <div px-6 pt-5>
        <h1 font-bold text-headline-small>Drafts & sent</h1>
        <MessageDraftsAndSentTabs v-model="tab" />
      </div>
      <v-divider />
      <div p-6 flex-1 min-h-0 overflow-y-auto>
        <v-window v-model="tab">
          <v-window-item :value="DraftsAndSentTab.Drafts">
            <MessageDraftsAndSentDraftList />
          </v-window-item>
          <v-window-item :value="DraftsAndSentTab.Scheduled">
            <MessageDraftsAndSentScheduledList />
          </v-window-item>
          <v-window-item :value="DraftsAndSentTab.Sent">
            <MessageDraftsAndSentList />
          </v-window-item>
        </v-window>
      </div>
      <MessageDraftsAndSentScheduleDialog />
    </div>
  </NuxtLayout>
</template>
