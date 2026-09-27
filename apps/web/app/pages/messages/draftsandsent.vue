<script setup lang="ts">
import { DraftsAndSentTab, DraftsAndSentTabs } from "@/models/message/draftsAndSent/DraftsAndSentTab";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { TAB_QUERY_PARAMETER_KEY } from "@/services/route/constants";

definePageMeta({ middleware: "auth" });
useHead({ title: "Drafts & sent" });

const tab = useEnumRouteQuery(TAB_QUERY_PARAMETER_KEY, DraftsAndSentTabs, DraftsAndSentTab.Drafts);
const readDraftsAndSent = useReadDraftsAndSent();
await readDraftsAndSent();
</script>

<template>
  <NuxtLayout is-viewport-height>
    <template #left>
      <MessageLeftSideBar />
    </template>
    <div h-full of-y-auto>
      <div p-6 flex flex-col gap-4 ui-body>
        <div flex gap-2 items-center>
          <AppDrawerButton label="Show Room List" :meaning="UiIconMeaning.Menu" />
          <h1 ui-title>Drafts & sent</h1>
        </div>
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
