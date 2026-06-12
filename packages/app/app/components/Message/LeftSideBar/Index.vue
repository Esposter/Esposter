<script setup lang="ts">
import type { Item } from "@/models/shared/Item";

import { useInputStore } from "@/store/message/input";
import { RoutePath } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const router = useRouter();
const inputStore = useInputStore();
const { draftRoomIds } = storeToRefs(inputStore);
const scheduledMessageJobCount = await $trpc.message.scheduledMessageJob.readMyScheduledJobsCount.query();
const items = computed(
  () =>
    [
      {
        icon: "mdi-account-group-outline",
        onClick: async () => {
          await navigateTo(RoutePath.MessagesFriends);
        },
        title: "Friends",
        value: RoutePath.MessagesFriends,
      },
      {
        badges: [
          { count: draftRoomIds.value.size, icon: "mdi-pencil" },
          { count: scheduledMessageJobCount, icon: "mdi-clock-outline" },
        ].filter(({ count }) => count > 0),
        icon: "mdi-send-outline",
        onClick: async () => {
          await navigateTo(RoutePath.MessagesDraftsSent);
        },
        title: "Drafts & sent",
        value: RoutePath.MessagesDraftsSent,
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
        v-for="{ badges, icon, onClick, title, value } of items"
        :key="value"
        font-bold
        :active="router.currentRoute.value.path === value"
        :prepend-icon="icon"
        :title
        @click="onClick()"
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
