<script setup lang="ts">
import type { UiListItem } from "@/models/ui/UiListItem";

import { DraftsAndSentTab } from "@/models/message/draftsAndSent/DraftsAndSentTab";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DraftsAndSentTabMetadataMap } from "@/services/message/draftsAndSent/DraftsAndSentTabMetadataMap";
import { useInputStore } from "@/store/message/input";
import { RoutePath } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const { currentRoute } = useRouter();
const inputStore = useInputStore();
const { drafts } = storeToRefs(inputStore);
const scheduledMessageJobCount = await $trpc.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query();
const items = computed<UiListItem<string>[]>(() => [
  {
    isCurrent: currentRoute.value.path === RoutePath.MessagesFriends,
    meaning: UiIconMeaning.Friends,
    title: "Friends",
    to: RoutePath.MessagesFriends,
    value: RoutePath.MessagesFriends,
  },
  {
    icon: DraftsAndSentTabMetadataMap[DraftsAndSentTab.Sent].icon,
    isCurrent: currentRoute.value.path === RoutePath.MessagesDraftsAndSent,
    title: "Drafts & sent",
    to: RoutePath.MessagesDraftsAndSent,
    value: RoutePath.MessagesDraftsAndSent,
  },
]);
// What waits in drafts and in the schedule, read at the row's end as a channel's unread count is
const badges = computed(() =>
  [DraftsAndSentTab.Drafts, DraftsAndSentTab.Scheduled]
    .map((tab) => ({
      count: tab === DraftsAndSentTab.Drafts ? drafts.value.size : scheduledMessageJobCount,
      icon: DraftsAndSentTabMetadataMap[tab].icon,
      title: DraftsAndSentTabMetadataMap[tab].title,
    }))
    .filter(({ count }) => count > 0),
);
</script>

<template>
  <div flex flex-col h-full ui-body>
    <MessageLeftSideBarHeader />
    <div px-2 flex-1 of-y-auto>
      <UiList :items label="Messages">
        <template #append="{ item }">
          <template v-if="item.value === RoutePath.MessagesDraftsAndSent">
            <UiChip v-for="{ count, icon, title } of badges" :key="title">
              <span :class="icon" aria-hidden="true" size-6 />
              {{ count }}
              <span sr-only>{{ title }}</span>
            </UiChip>
          </template>
        </template>
      </UiList>
      <MessageLeftSideBarRooms />
      <MessageLeftSideBarDirectMessages />
    </div>
    <MessageLeftSideBarStatusBar />
  </div>
</template>
