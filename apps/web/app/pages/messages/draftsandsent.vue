<script setup lang="ts">
import { DraftsAndSentTab, DraftsAndSentTabs } from "@/models/message/draftsAndSent/DraftsAndSentTab";
import { TAB_QUERY_PARAMETER_KEY } from "@/services/route/constants";

definePageMeta({ middleware: "auth" });
useHead({ title: "Drafts & sent" });

const tab = useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, DraftsAndSentTabs, DraftsAndSentTab.Drafts);
const readDraftsAndSent = useReadDraftsAndSent();
await readDraftsAndSent();
</script>

<template>
  <NuxtLayout hide-global-scrollbar>
    <template #left>
      <MessageLeftSideBar />
    </template>
    <div h-full of-y-auto>
      <div p-6 flex flex-col gap-4 ui-body>
        <h1 ui-title>Drafts & sent</h1>
        <MessageDraftsAndSentTabs v-model="tab">
          <template #default="{ value }">
            <MessageDraftsAndSentDraftList v-if="value === DraftsAndSentTab.Drafts" />
            <MessageDraftsAndSentScheduledList v-else-if="value === DraftsAndSentTab.Scheduled" />
            <MessageDraftsAndSentSentList v-else />
          </template>
        </MessageDraftsAndSentTabs>
      </div>
      <MessageDraftsAndSentScheduleDialog />
    </div>
  </NuxtLayout>
</template>
