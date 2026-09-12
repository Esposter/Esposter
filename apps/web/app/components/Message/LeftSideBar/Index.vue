<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { DraftsAndSentTab } from "@/models/message/draftsAndSent/DraftsAndSentTab";
import { DraftsAndSentTabMetadataMap } from "@/services/message/draftsAndSent/DraftsAndSentTabMetadataMap";
import { useInputStore } from "@/store/message/input";
import { RoutePath } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const { currentRoute } = useRouter();
const inputStore = useInputStore();
const { drafts } = storeToRefs(inputStore);
const scheduledMessageJobCount = await $trpc.message.scheduledMessageJob.readMyScheduledMessageJobsCount.query();
const items = computed(
  () =>
    [
      {
        icon: "mdi-account-group-outline",
        title: "Friends",
        value: RoutePath.MessagesFriends,
      },
      {
        badges: [
          { count: drafts.value.size, icon: DraftsAndSentTabMetadataMap[DraftsAndSentTab.Drafts].icon },
          { count: scheduledMessageJobCount, icon: DraftsAndSentTabMetadataMap[DraftsAndSentTab.Scheduled].icon },
        ].filter(({ count }) => count > 0),
        icon: DraftsAndSentTabMetadataMap[DraftsAndSentTab.Sent].icon,
        title: "Drafts & sent",
        value: RoutePath.MessagesDraftsAndSent,
      },
    ] satisfies Item[],
);
</script>

<template>
  <div flex flex-col h-full>
    <MessageLeftSideBarHeader />
    <v-divider />
    <div flex-1 overflow-y-auto>
      <v-list-item
        v-for="{ badges, icon, title, value } of items"
        :key="value"
        font-bold
        :active="currentRoute.path === value"
        :prepend-icon="icon"
        :title
        :to="value"
      >
        <template v-if="badges?.length" #append>
          <div flex items-center text-body-small>
            <template v-for="{ count, icon: badgeIcon } of badges" :key="badgeIcon">
              <v-icon :icon="badgeIcon" size="x-small" />
              <span>{{ count }}</span>
            </template>
          </div>
        </template>
      </v-list-item>
      <v-divider />
      <MessageLeftSideBarRooms />
      <v-divider />
      <MessageLeftSideBarDirectMessages />
    </div>
    <MessageLeftSideBarStatusBar />
  </div>
</template>
